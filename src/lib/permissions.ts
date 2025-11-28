export const ROLE_PERMISSIONS = {
  super_admin: {
    // users: { create: false, read: true, update: true, delete: true },
    // vehicles: {
    //   create: false,
    //   read: true,
    //   update: true,
    //   delete: true,
    //   approve: true,
    // },
    // drivers: {
    //   create: false,
    //   read: true,
    //   update: true,
    //   delete: true,
    // },
  },

  admin: {
    // users: { create: false, read: true, update: true, delete: false },
    // vehicles: {
    //   create: false,
    //   read: true,
    //   update: true,
    //   delete: false,
    //   approve: false,
    // },
    // drivers: {
    //   create: false,
    //   read: true,
    //   update: true,
    //   delete: false,
    //   approve: false,
    // },
  },
  hr: {
    users: { create: true, read: true, update: true, delete: false },
  },

  it_support: {
    users: { create: false, read: true, update: true, delete: false },
  },

  driver: {
    users: { create: false, read: false, update: false, delete: false },
  },

  rider: {
    users: { create: false, read: false, update: false, delete: false },
  },

  finance: {
    users: { create: false, read: true, update: false, delete: false },
  },
};
