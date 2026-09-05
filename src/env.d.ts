interface ImportMetaEnv {
  /** Telefono de contacto de Lucia, en formato internacional (+34...). */
  readonly TEL_LUCIA?: string;
  /** Telefono de contacto de Manuel, en formato internacional (+34...). */
  readonly TEL_MANUEL?: string;
  /** Numero de cuenta para los regalos, sin espacios (ES00...). */
  readonly IBAN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
