const getValue = (key: string): string => {
    const value = process.env[key];
    if (!value) {
      throw Error(`Unable to retrieve value for setting key '${key}'`);
    }
    return value;
  };
  
  const getOptionalValue = (key: string): string => {
    const value = process.env[key];
    if (!value) {
      return "";
    }
    return value;
  };
  
  const AD_TENANT_ID: string = getValue("AzureAd:TenantId");
  const CONTENT_STORAGES: string = getValue("AzureAd:ContentStorages");
  
  export {
    AD_TENANT_ID,
    CONTENT_STORAGES,
  };
  