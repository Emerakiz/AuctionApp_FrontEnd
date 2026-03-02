export interface UserDTO {
  userId: number;
  name: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
}

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

export interface Auction {
  auctionId: number;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  userName: string;
  userId: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

export interface Bid {
  bidId: number;
  amount: number;
  userName: string;
  userId: number;
  bidDate: string;
}

export interface UserDTO {
  userId: number;
  username: string;
  email: string;
  isAdmin: boolean;
  isActive: boolean;
}