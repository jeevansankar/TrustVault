import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
 /*
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── apiClient.js
│   │   ├── authApi.js
│   │   ├── documentApi.js
│   │   ├── permissionApi.js
│   │   └── auditApi.js
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── navigation/
│   │   ├── documents/
│   │   └── dashboard/
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── layouts/
│   │   ├── AuthLayout.jsx
│   │   └── DashboardLayout.jsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Register.jsx
│   │   │   ├── VerifyOtp.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── VerifyResetOtp.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Documents.jsx
│   │   ├── UploadDocument.jsx
│   │   ├── DocumentDetails.jsx
│   │   ├── SharedWithMe.jsx
│   │   ├── Permissions.jsx
│   │   ├── AuditLogs.jsx
│   │   └── Security.jsx
│   ├── routes/
│   │   ├── AppRoutes.jsx
│   │   └── ProtectedRoute.jsx
│   ├── styles/
│   │   └── global.css
│   ├── App.jsx
│   └── main.jsx
├── .env
├── index.html
├── package.json
└── vite.config.js
 */