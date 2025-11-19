/*
Helper converters and small utilities to read/write typed documents
from Firestore. These converters can be used with the Firestore SDK so
you keep type-safety at the call sites.


Example usage:
const userRef = doc(db, 'users', uid).withConverter(userConverter);
const snap = await getDoc(userRef);
const user = snap.data(); // typed User | undefined
*/


import { FirestoreDataConverter } from 'firebase/firestore';
import { User } from '../types/user';
import { Driver } from '../types/driver';
import { Ride } from '../types/ride';
import { ChatMessage, ChatSummary } from '../types/chat';
import { Payment, Payout } from '../types/payment';
import { Settings } from '../types/settings';


export const userConverter: FirestoreDataConverter<User> = {
toFirestore(user: User) {
return { ...user };
},
fromFirestore(snapshot) {
const data = snapshot.data() as any;
return {
...data,
uid: snapshot.id,
} as User;
},
};


export const driverConverter: FirestoreDataConverter<Driver> = {
toFirestore(driver: Driver) {
return { ...driver };
},
fromFirestore(snapshot) {
const data = snapshot.data() as any;
return {
...data,
driverId: snapshot.id,
} as Driver;
},
};


export const rideConverter: FirestoreDataConverter<Ride> = {
toFirestore(ride: Ride) {
return { ...ride };
},
fromFirestore(snapshot) {
const data = snapshot.data() as any;
return {
...data,
rideId: snapshot.id,
} as Ride;
},
};


export const chatSummaryConverter: FirestoreDataConverter<ChatSummary> = {
  toFirestore(c: ChatSummary) {
    return {
      participants: c.participants,
      lastMessage: c.lastMessage ?? "",
      updatedAt: c.updatedAt ?? new Date().toISOString(),
      unread: c.unread ?? {},
    };
  },

  fromFirestore(snapshot) {
    const data = snapshot.data() as any;
    return {
      chatId: snapshot.id,
      participants: data.participants,
      lastMessage: data.lastMessage,
      updatedAt: data.updatedAt,
      unread: data.unread ?? {},
    } as ChatSummary;
  },
};



export const chatMessageConverter: FirestoreDataConverter<ChatMessage> = {
  toFirestore(m: ChatMessage) {
    return {
      senderId: m.senderId,
      text: m.text ?? "",
      type: m.type ?? "text",
      createdAt: m.createdAt,
      readBy: m.readBy ?? [],
    };
  },

  fromFirestore(snapshot) {
    const data = snapshot.data() as any;
    return {
      messageId: snapshot.id,
      senderId: data.senderId,
      text: data.text,
      type: data.type,
      createdAt: data.createdAt,
      readBy: data.readBy ?? [],
    } as ChatMessage;
  },
};

