let Enum = {

    HTTP_CODES: {
        OK: 200,
        CREATED: 201,
        NO_CONTENT: 204,
        NOT_MODIFIED: 304,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        NOT_ACCEPTABLE: 406,
        TIMED_OUT: 408,
        CONFLICT: 409,
        GONE: 410,
        UNSUPPORTED_MEDIA_TYPE: 415,
        UNPROCESSIBLE_ENTITY: 422,
        TOO_MANY_REQUESTS: 429,
        INT_SERVER_ERROR: 500,
        BAD_GATEWAY: 502
    },

    EMITTERS: {
        NOTIFICATION: "notification"
    },

    PASS_LENGTH: 8,

    USER_ROLES: {
        SUPER_USER: "SUPER_USER",
        USER: "USER"
    },


    privGroups: [

        {
            id: "Dashboard",
            name: "Dashboard Permissions"
        }, {
            id: "User",
            name: "User Permissions"
        },
        {
            id: "Role",
            name: "Role Permissions"
        },
        {
            id: "Category",
            name: "Category Permissions"
        },
        {
            id: "AuditLogs",
            name: "AuditLogs Permissions"
        }
    ],
    Privileges: [
        {
            Key: "dashboard_view",
            Name: "View",
            Group: "Dashboard",
            Description: "Dashboard Permissions",
            type: "system"
        },
        {
            Key: "user_view",
            Name: "View",
            Group: "User",
            Description: "User Permissions",
            type: "system"
        },
        {
            Key: "user_add",
            Name: "Add",
            Group: "User",
            Description: "User Permissions",
            type: "system",
            dependencies: { and: ["user_view", "role_view"] }
        },
        {
            Key: "user_update",
            Name: "Update",
            Group: "User",
            Description: "User Permissions",
            type: "system",
            dependencies: { and: ["user_view", "role_view"] }
        },
        {
            Key: "user_delete",
            Name: "Delete",
            Group: "User",
            Description: "User Permissions",
            type: "system",
            dependencies: { and: ["user_view"] }
        },
        {
            Key: "role_view",
            Name: "View",
            Group: "Role",
            Description: "Role Permissions",
            type: "system"
        },
        {
            Key: "role_add",
            Name: "Add",
            Group: "Role",
            Description: "Role Permissions",
            type: "system",
            dependencies: { and: ["role_view"] }
        },
        {
            Key: "role_update",
            Name: "Update",
            Group: "Role",
            Description: "Role Permissions",
            type: "system",
            dependencies: { and: ["role_view"] }
        },
        {
            Key: "role_delete",
            Name: "Delete",
            Group: "Role",
            Description: "Role Permissions",
            type: "system",
            dependencies: { and: ["role_view"] }
        },
        {
            Key: "category_view",
            Name: "View",
            Group: "Category",
            Description: "Category Permissions",
            type: "system"
        },
        {
            Key: "category_add",
            Name: "Add",
            Group: "Category",
            Description: "Category Permissions",
            type: "system",
            dependencies: { and: ["category_view"] }
        },
        {
            Key: "category_update",
            Name: "Update",
            Group: "Category",
            Description: "Category Permissions",
            type: "system",
            dependencies: { and: ["category_view"] }
        },
        {
            Key: "category_delete",
            Name: "Delete",
            Group: "Category",
            Description: "Category Permissions",
            type: "system",
            dependencies: { and: ["category_view"] }
        },
        {
            Key: "auditlog_view",
            Name: "View",
            Group: "AuditLogs",
            Description: "AuditLogs Permissions",
            type: "system"
        }
    ],
    TRANSPORT: {
        "CONSOLE": "CONSOLE",
        "FILE": "FILE",
        "DB": "DB"
    },
    LOG_LEVELS: {
        "ERROR": 0,
        "WARN": 1,
        "INFO": 2,
        "HTTP": 3,
        "VERBOSE": 4,
        "DEBUG": 5,
        "SILLY": 6
    },

    LANG: {
        "en": "en",
        "tr": "tr"
    }
}

module.exports = Enum;