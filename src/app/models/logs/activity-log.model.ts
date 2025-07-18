export interface ActivityLog {
  id: number;
  message: string;
  timestamp: string; // Primit ca string deja formatat de la backend
  logType: string; // ex: "PRODUCT", "CATEGORY", "ORDER"
  operationType: string; // ex: "CREATE", "UPDATE", "DELETE"
}
