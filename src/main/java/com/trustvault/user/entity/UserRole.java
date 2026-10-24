package com.trustvault.user.entity;

public enum UserRole{
    ADMIN,
    OWNER,
    VIEWER
}
/*
ADMIN — can access the authorized administrative dashboard and system activity.
OWNER — can upload and manage their own documents and grant or revoke document permissions.
VIEWER — can access documents only when the appropriate document-level permission is granted. */