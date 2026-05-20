-- Tabla de auditoría de envíos (append-only)
IF NOT EXISTS (
  SELECT * FROM sys.objects
  WHERE object_id = OBJECT_ID(N'[dbo].[AUDIT_EMAIL_DELIVERY]') AND type = N'U'
)
BEGIN
  CREATE TABLE dbo.AUDIT_EMAIL_DELIVERY (
    id               INT          IDENTITY(1,1) PRIMARY KEY,
    timestamp_inicio DATETIME2    NOT NULL DEFAULT GETDATE(),
    timestamp_fin    DATETIME2,
    status           VARCHAR(20)  NOT NULL,   -- SUCCESS / FAILED / RETRYING
    recipient        VARCHAR(200) NOT NULL,
    txt_file         VARCHAR(500),
    excel_file       VARCHAR(500),
    error_count      INT          DEFAULT 0,
    retry_count      INT          DEFAULT 0,
    error_message    VARCHAR(2000)
  );

  PRINT 'Tabla AUDIT_EMAIL_DELIVERY creada.';
END
ELSE
  PRINT 'Tabla AUDIT_EMAIL_DELIVERY ya existe.';
GO
