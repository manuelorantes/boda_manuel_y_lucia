interface ImportMetaEnv {
  /** Telefono de contacto de Lucia, en formato internacional (+34...). */
  readonly TEL_LUCIA?: string;
  /** Telefono de contacto de Manuel, en formato internacional (+34...). */
  readonly TEL_MANUEL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
