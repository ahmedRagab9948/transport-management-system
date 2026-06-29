'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { ROUTES } from '@/constants/routes';
import { getApiErrorMessage } from '@/lib/api/unwrap';
import { useT } from '@/lib/i18n';
import { useAuth } from '../hooks/use-auth';
import { createOtpSchema, type OtpFormValues } from '../schemas/otp.schema';
import { otpSessionStorage } from '../utils/otp-session-storage';

export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyOtp, resendOtp } = useAuth();
  const { t } = useT();
  const [session, setSession] = useState(() => otpSessionStorage.get());
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const schema = createOtpSchema(t);
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: '' },
  });

  useEffect(() => {
    if (!session) {
      router.replace(ROUTES.login);
    }
  }, [session, router]);

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow numeric input
    const numericValue = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = numericValue.slice(-1); // Take only last character
    setOtpDigits(newDigits);

    // Auto-focus next input
    if (numericValue && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Update form value
    const code = newDigits.join('');
    form.setValue('code', code);

    // Auto-submit when all 6 digits are filled
    if (code.length === 6) {
      form.handleSubmit((values) => {
        verifyMutation.mutate(values.code);
      })();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);
    form.setValue('code', newDigits.join(''));
    
    // Focus the next empty input or the last one if all filled
    const nextEmptyIndex = newDigits.findIndex(d => d === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const verifyMutation = useMutation({
    mutationFn: (code: string) =>
      verifyOtp({ otpSessionId: session!.otpSessionId, code }),
    onSuccess: () => {
      const redirect = searchParams.get('redirect') ?? ROUTES.dashboard;
      router.replace(redirect);
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => resendOtp(session!.otpSessionId),
    onSuccess: () => {
      setSession(otpSessionStorage.get());
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    verifyMutation.mutate(values.code);
  });

  if (!session) return null;

  const errorMessage = verifyMutation.error
    ? getApiErrorMessage(verifyMutation.error, t('auth.verification_failed'))
    : null;
  const expiresLabel = session.expiresAt
    ? new Date(session.expiresAt).toLocaleTimeString()
    : undefined;

  return (
    <motion.form
      onSubmit={onSubmit}
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.15 }}
    >
      <FieldGroup className="gap-6">
        <Field data-invalid={!!form.formState.errors.code}>
          <FieldLabel htmlFor="code" className="text-sm font-semibold tracking-tight text-foreground/80 flex items-center gap-1.5">
            <ShieldCheck className="size-5 text-primary" aria-hidden />
            {t('auth.verification_code')}
          </FieldLabel>
          <FieldDescription className="text-xs text-muted-foreground/80 leading-relaxed mb-3">
            {session.email ? (
              <>{t('auth.code_sent_to', { email: session.email })}</>
            ) : (
              <>{t('auth.code_from_authenticator')}</>
            )}
            {expiresLabel ? (
              <> <span className="font-semibold text-warning">{t('auth.code_expires_at', { time: expiresLabel })}</span></>
            ) : null}
          </FieldDescription>
          <div className="flex gap-2 justify-center">
            {otpDigits.map((digit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
              >
                <Input
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="h-14 w-12 text-center text-2xl font-bold rounded-lg border-border/80 bg-muted/10 transition-all duration-200 focus-visible:bg-background focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary focus-visible:scale-110"
                  aria-label={t('auth.otp_digit', { number: index + 1 })}
                />
              </motion.div>
            ))}
          </div>
          <FieldError errors={[form.formState.errors.code]} />
        </Field>
      </FieldGroup>

      {errorMessage ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.2 }}
        >
          <Alert variant="destructive" className="border-destructive/30 bg-destructive/10 py-2.5 rounded-lg">
            <AlertDescription className="text-sm font-medium">{errorMessage}</AlertDescription>
          </Alert>
        </motion.div>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        disabled={verifyMutation.isPending}
      >
        {verifyMutation.isPending ? (
          <><Loader2 className="size-5 animate-spin me-2" /> {t('auth.verifying')}</>
        ) : (
          t('auth.verify_and_continue')
        )}
      </Button>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          disabled={resendMutation.isPending}
          onClick={() => resendMutation.mutate()}
          className="h-9 rounded-lg text-xs font-semibold px-3 transition-all duration-200 active:scale-[0.97]"
        >
          {resendMutation.isPending ? (
            <><Loader2 className="size-3 animate-spin me-1.5" /> {t('auth.sending')}</>
          ) : (
            t('auth.resend_code')
          )}
        </Button>
        <Link 
          href={ROUTES.login} 
          className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'h-9 rounded-lg text-xs font-semibold hover:bg-muted/50 px-3 transition-all duration-200 active:scale-[0.97]' })}
        >
          <ArrowLeft className="size-3.5 me-1" aria-hidden /> {t('auth.back_to_login')}
        </Link>
      </div>
    </motion.form>
  );
}
