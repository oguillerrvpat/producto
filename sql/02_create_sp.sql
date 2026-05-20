-- AJUSTAR los nombres de columnas según el esquema real de ZCARLOGVENTAS
-- Columnas esperadas por el pipeline:
--   fecha_hora, tienda, tipo_error, descripcion, producto, monto, severidad

CREATE OR ALTER PROCEDURE dbo.SP_GENERATE_ERROR_REPORT
  @fecha DATE = NULL
AS
BEGIN
  SET NOCOUNT ON;

  -- Usa la fecha de hoy si no se pasa parámetro
  SET @fecha = ISNULL(@fecha, CAST(GETDATE() AS DATE));

  SELECT
    CONVERT(VARCHAR(20), fecha_hora, 120)  AS fecha_hora,
    tienda,
    tipo_error,
    descripcion,
    producto,
    ISNULL(monto, 0)                       AS monto,
    severidad
  FROM dbo.ZCARLOGVENTAS
  WHERE CAST(fecha_hora AS DATE) = @fecha
  ORDER BY tienda ASC, monto DESC;
END
GO
