export interface Vehicle {
  id: string;
  model: string;
  plateNumber: string;
  color: string;
  type: "car" | "bajaj" | "bike";
  status: "active" | "inactive" | "suspended";
  createdAt: string;
}
