export class AutoOrg {
    KaspiToken: string = '';
    isPaid: string = 'false';  // ✅ string type
    capacity: number = 0;
    minPriceGlob: number = 0;
    stepGlob: number = 0;
    maxPriceGlob: number = 0;
    isOn: string = 'off';
    kaspiLoginEmail: string = '';
    kaspiPasswordEncrypted: string = '';
  
    constructor(init?: Partial<AutoOrg>) {
      Object.assign(this, {
        KaspiToken: '',
        isPaid: 'false',              // ✅ consistent string default
        capacity: 0,
        minPriceGlob: 0,
        stepGlob: 0,
        maxPriceGlob: 0,
        isOn: 'off',
        kaspiLoginEmail: '',
        kaspiPasswordEncrypted: '',
        ...init,
      });
    }
  }
  