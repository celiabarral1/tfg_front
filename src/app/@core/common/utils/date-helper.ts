export class DateHelper {
    constructor() {}
  
    calculateTimeRange(timeOption: string): { startDate: string, endDate: string } {
      const currentDate = new Date();
      let startDate: Date;
  
      switch (timeOption) {
        case '15d':
          // 15 días atrás
          startDate = new Date(currentDate.setDate(currentDate.getDate() - 15));
          break;
        case '1m':
          // 1 mes atrás
          startDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
          break;
        case '1y':
          // 1 año atrás
          startDate = new Date(currentDate.setFullYear(currentDate.getFullYear() - 1));
          break;
        default:
          startDate = currentDate;
          break;
      }
  
      // Asegúrate de mantener la fecha final como la fecha actual
      const endDate = new Date();
  
      return {
        startDate: startDate.toISOString().split('T')[0], // Convertir a formato YYYY-MM-DD
        endDate: endDate.toISOString().split('T')[0], // Convertir a formato YYYY-MM-DD
      };
    }
  }
  