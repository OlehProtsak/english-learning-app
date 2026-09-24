type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type Course = {
  id: number;
  title: string;
  description: string;
  level: Level;
};
