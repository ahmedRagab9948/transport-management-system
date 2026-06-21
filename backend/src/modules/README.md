# Backend Modules

Feature modules (auth, trips, vehicles, drivers, etc.) are added here.

Each module should follow:

```
module-name/
├── controllers/
├── services/
├── dto/
├── entities/
├── repositories/
├── enums/
├── interfaces/
└── validators/
```

Register modules in `app.module.ts` when implemented.
