// const userNotificationsPreferencesInitialCreateInput = () => {
//   const result: Prisma.UserNotificationPreferencesCreateManyUserInput[] = [];
//   for (let notificationTypeKey in NotificationType) {
//     result.push({ notificationType: notificationTypeKey as NotificationType });
//   }
//   return result;
// };
//
// export type UserStatusResponse = "OK" | "ERROR" | "INVALID_PARAMS";
//
// export const getMe = async (id: number) => {
//   const me = await prisma.user.findUnique({
//     where: { id },
//     select: {
//       firstname: true,
//       lastname: true,
//       username: true,
//       profileImage: true,
//       email: true,
//       age: true,
//       country: true,
//       pronouns: true,
//       aboutMe: true,
//       gender: true,
//       ethnicity: true,
//       onboardingCompleted: true,
//       administratedCorporations: { select: { corporation: true } },
//       administratedNonprofits: { select: { nonprofit: true } },
//       provider: true,
//       jobTitle: true,
//       departmentId: true,
//       interests: true,
//       employer: {
//         select: {
//           id: true,
//           path: true,
//           name: true,
//           logoUrl: true,
//         },
//       },
//       employmentNonprofit: {
//         select: {
//           id: true,
//           path: true,
//           name: true,
//           logoUrl: true,
//           description: true,
//           city: true,
//           province: true,
//           bannerUrl: true,
//           claimed: true,
//           interests: {
//             select: {
//               interestId: true,
//             },
//           },
//         },
//       },
//     },
//   });
//
//   return {
//     ...me,
//     fullName: buildFullName({
//       firstName: me.firstname,
//       lastName: me.lastname,
//     }),
//     canUpdatePassword:
//       me.provider !== UserProvider.GOOGLE &&
//       me.provider !== UserProvider.LINKEDIN,
//     provider: undefined, // Do not send provider to the client
//     pronouns: RemoveSensitivePronouns(me.pronouns),
//     administratedCorporations: me.administratedCorporations.map(
//       (c) => c.corporation
//     ),
//     administratedNonprofits: me.administratedNonprofits.map((n) => n.nonprofit),
//   };
// };
//
// export type GetMeResult = Prisma.PromiseReturnType<typeof getMe>;
//
// export const getUserByEmail = (email: string) =>
//   getOneInternal({ email: email?.toLowerCase() || "" });
//
// export const getUserById = (id: number) => getOneInternal({ id });
//
// //FIXME: now we are returning the entire entity to the client. Should be changed for selects with
// //only the fields used
// const getOneInternal = (where) =>
//   prisma.user.findUnique({
//     where,
//     include: {
//       administratedCorporations: { include: { corporation: true } },
//       administratedNonprofits: { include: { nonprofit: true } },
//     },
//   });
//
// export type GetUserResult = Prisma.PromiseReturnType<typeof getOneInternal>;
//
// const createUserWithCredentialsInternal = async (
//   firstName: string,
//   lastName: string,
//   email: string,
//   password: string
// ) =>
//   prisma.user.create({
//     data: {
//       firstname: firstName,
//       lastname: lastName,
//       fullname: buildFullName({
//         firstName: firstName,
//         lastName: lastName,
//       }),
//       email,
//       username: email,
//       password: await encryptPassword(password),
//       provider: "NONE",
//       notificationPreferences: {
//         createMany: {
//           data: userNotificationsPreferencesInitialCreateInput(),
//         },
//       },
//     },
//     select: {
//       id: true,
//       firstname: true,
//       lastname: true,
//       email: true,
//     },
//   });
//
// export type CreateUserWithCredentialsInternalReturn = Prisma.PromiseReturnType<
//   typeof createUserWithCredentialsInternal
// >;
//
// const sendValidationEmail = async (
//   email: string,
//   userFullName: string,
//   validationToken: string
// ) => {
//   const html = render(
//     <UserVerificationEmail
//       userFullName={userFullName}
//       verificationUrl={`${
//         process.env.NEXT_PUBLIC_URL
//       }/verify-email?token=${encodeURIComponent(validationToken)}`}
//     />
//   );
//
//   return sendMail(
//     email,
//     html,
//     "Henry Schein Games: Verify your email by clicking on the link"
//   );
// };
//
// export const resendUserValidationEmail = async (userId: number) => {
//   const oldEmailValidation = await prisma.emailValidation.findFirst({
//     where: { userId, type: "USER_SIGNUP", useDate: null },
//     include: { user: true },
//     orderBy: { expiration: "desc" },
//   });
//
//   const token = await createValidationToken(userId, "USER_SIGNUP", 7 * 24);
//
//   await sendValidationEmail(
//     oldEmailValidation.user.email,
//     oldEmailValidation.user.firstname,
//     token
//   );
//   return true;
// };
//
// export const signUpEmailFlow = async (
//   email: string
// ): Promise<{ status: UserStatusResponse }> => {
//   if (!email) {
//     return {
//       status: "INVALID_PARAMS",
//     };
//   }
//
//   //Notify users email
//   try {
//     // TODO send email with code
//     const user = await prisma.user.findUnique({
//       where: { email: email?.toLowerCase()?.replace(/[‘’`]/g, "'") || "" },
//     });
//     if (!user) {
//       return {
//         // we send ok even though we don't have a user, so we don't leak email information
//         status: "OK",
//       };
//     }
//
//     //Token for e=mail validation
//     const validityHours = 7 * 24; //7 days
//     const validationToken = await createValidationEmailToken(
//       user.id,
//       "USER_SIGNUP",
//       validityHours
//     );
//
//     //Notify users email
//     await sendValidationEmail(user.email, user.firstname, validationToken);
//
//     return {
//       status: "OK",
//     };
//   } catch (err) {
//     console.error(err);
//     return {
//       status: "ERROR",
//     };
//   }
// };
//
// export type SignUpEmailFlowResult = Prisma.PromiseReturnType<
//   typeof signUpEmailFlow
// >;
//
// export const validateEmailToken = async (token: string) => {
//   const r = await prisma.emailValidation.findFirst({
//     where: { token: token, expiration: { gte: new Date() } },
//     select: {
//       user: {
//         select: {
//           firstname: true,
//           lastname: true,
//         },
//       },
//     },
//   });
//   return {
//     isValid: !!r,
//     firstname: r?.user?.firstname,
//     lastname: r?.user?.lastname,
//   };
// };
//
// const updateUserFromApp = async (
//   id: number,
//   slackTeamId: string,
//   corporationId: number,
//   userAppId: string,
//   app: UserAppProvider,
//   causes?: number[] | undefined,
//   department?: number
// ) => {
//   if (causes) {
//     return prisma.user.update({
//       where: {
//         id,
//       },
//       data: {
//         employerId: corporationId,
//         interests: {
//           deleteMany: {
//             userId: id,
//           },
//           connectOrCreate: causes.map((c) => {
//             return {
//               where: {
//                 userId_interestId: {
//                   interestId: c,
//                   userId: id,
//                 },
//               },
//               create: {
//                 interestId: c,
//               },
//             };
//           }),
//         },
//         departmentId: department,
//         apps: {
//           upsert: {
//             where: {
//               userId_provider: {
//                 userId: id,
//                 provider: app,
//               },
//             },
//             create: {
//               config: {
//                 workspaceId: slackTeamId,
//                 userId: userAppId,
//               },
//               provider: app,
//             },
//             update: {
//               config: {
//                 workspaceId: slackTeamId,
//                 userId: userAppId,
//               },
//             },
//           },
//         },
//       },
//       select: {
//         id: true,
//         firstname: true,
//         lastname: true,
//         email: true,
//       },
//     });
//   }
//   if (!causes) {
//     return prisma.user.update({
//       where: {
//         id,
//       },
//       data: {
//         employerId: corporationId,
//         departmentId: department,
//         apps: {
//           upsert: {
//             where: {
//               userId_provider: {
//                 userId: id,
//                 provider: app,
//               },
//             },
//             create: {
//               config: {
//                 workspaceId: slackTeamId,
//                 userId: userAppId,
//               },
//               provider: app,
//             },
//             update: {
//               config: {
//                 workspaceId: slackTeamId,
//                 userId: userAppId,
//               },
//             },
//           },
//         },
//       },
//       select: {
//         id: true,
//         firstname: true,
//         lastname: true,
//         email: true,
//       },
//     });
//   }
// };
//
// export type UpdateUserFromApp = Prisma.PromiseReturnType<
//   typeof updateUserFromApp
// >;
//
// export const getUserIdByEmail = (email: string) =>
//   prisma.user
//     .findUnique({
//       where: { email: email?.toLowerCase() || "" },
//       select: { id: true },
//     })
//     .then(({ id }) => id);
//
// export type GetUserIdByEmailResult = Prisma.PromiseReturnType<
//   typeof getUserIdByEmail
// >;
//
// export const getFollowedNonprofits = async (userId: number) => {
//   const data = await prisma.individualSupportedNonprofit.findMany({
//     where: { userId },
//     select: {
//       nonprofit: {
//         select: {
//           id: true,
//           name: true,
//           path: true,
//           logoUrl: true,
//           bannerUrl: true,
//           description: true,
//           province: true,
//           city: true,
//           claimed: true,
//           interests: {
//             select: {
//               interestId: true,
//             },
//           },
//           paypalId: true,
//         },
//       },
//     },
//   });
//
//   return data?.map((c) => c.nonprofit);
// };
//
// export type GetFollowedNonprofitsResult = Prisma.PromiseReturnType<
//   typeof getFollowedNonprofits
// >;
//
// export const resetPassword = async (token: string, password: string) => {
//   const tokenValidation = await validateToken(token);
//   if (tokenValidation.status !== "Valid") return false;
//   if (!isValidPassword(password)) return false;
//
//   const passHash = await encryptPassword(password);
//
//   await prisma.$transaction(async (prisma) => {
//     const userPromise = prisma.user.update({
//       where: { id: tokenValidation.userId },
//       data: {
//         password: passHash,
//       },
//     });
//
//     const tokenPromise = markTokenAsUsed(token, new Date(), prisma);
//
//     await Promise.all([userPromise, tokenPromise]);
//   });
//
//   return true;
// };
//
// export const changePassword = async (userId: number, password: string) => {
//   if (!isValidPassword(password)) return false;
//
//   const passHash = await encryptPassword(password);
//
//   await prisma.user.update({
//     where: { id: userId },
//     data: {
//       password: passHash,
//     },
//   });
// };
//
export const existsUserWithEmail = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email?.toLowerCase() || "" },
    select: { deletedAt: true },
  });

  return { exists: !!user, deletedAccount: !!user?.deletedAt };
};
//
// export const existsUserWithEmailAndPassword = async (
//   email: string,
//   password: string
// ) => {
//   const user = await prisma.user.findUnique({
//     where: { email: email?.toLowerCase() || "" },
//     select: { password: true, provider: true },
//   });
//
//   // If user is registered with a provider, we don't need to validate the password
//   if (user?.provider !== "NONE") return true;
//
//   return await validatePassword(password, user?.password);
// };
//
// export const getUserByEmailForAuthorization = (email: string) =>
//   prisma.user.findFirst({
//     where: {
//       email: email?.toLowerCase() || "",
//       AND: [
//         {
//           deletedAt: {
//             equals: null,
//           },
//         },
//       ],
//     },
//     select: {
//       id: true,
//       email: true,
//       profileImage: true,
//       role: true,
//       password: true,
//       onboardingCompleted: true,
//       username: true,
//     },
//   });
//
// export type GetUserByIdForAuthenticationResult = Prisma.PromiseReturnType<
//   typeof getUserByIdForAuthentication
// >;
//
// export const getUserByIdForAuthentication = (id: number) =>
//   prisma.user.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       email: true,
//       username: true,
//       profileImage: true,
//       onboardingCompleted: true,
//       firstname: true,
//       lastname: true,
//       languagePreference: true,
//       employer: {
//         select: {
//           path: true,
//           matchMultiplier: true,
//         },
//       },
//       identityVerified: true,
//     },
//   });
//
// export const getUserByToken = async (token: string) => {
//   const data = await getUserIdByLinkAccess(token);
//   return data.user;
// };
//
// export const consumeSignInToken = async (token: string) => {
//   const data = await prisma.emailValidation.findFirst({
//     where: { token, expiration: { gt: new Date() } },
//     include: { user: true },
//   });
//
//   if (!data) {
//     return undefined;
//   }
//
//   await prisma.emailValidation.delete({
//     where: { id: data.id },
//   });
//
//   return data?.user;
// };
//
// export const getUserByTeamsData = async (
//   tenantId: string,
//   objectId: string
// ) => {
//   const corporationId = await getCorporationIdByTenant(tenantId);
//   const appUser = await prisma.appUser.findFirst({
//     where: {
//       NOT: [{ userId: null }],
//       corporationId,
//       extId: objectId,
//     },
//     select: {
//       user: true,
//     },
//   });
//   return appUser?.user;
// };
//
// export const canTeamsUserLogOn = async (tenantId: string, objectId: string) => {
//   const corporationId = await getCorporationIdByTenant(tenantId);
//   return (
//     (await prisma.appUser.count({
//       where: {
//         corporationId,
//         provider: "TEAMS",
//         extId: objectId,
//         user: {
//           deactivatedAt: { equals: null },
//           deletedAt: { equals: null },
//         },
//       },
//     })) > 0
//   );
// };
//
// class Cache {
//   static corporationsByTenant: { [key: string]: number } = {};
// }
//
// const getCorporationIdByTenant = async (tenantId: string) => {
//   const id = Cache.corporationsByTenant[tenantId];
//   if (!!id) return id;
//
//   const corporationId = (await getTeamsAppByTenantId(tenantId))?.corporationId;
//   if (!!corporationId) Cache.corporationsByTenant[tenantId] = corporationId;
//   return corporationId;
// };
//
// export const getActivityFeed = (userId: number) =>
//   prisma.userAppActivityFeed.findMany({
//     where: { userId },
//     select: {
//       createdAt: true,
//       teamsMessageContent: true,
//     },
//     orderBy: { createdAt: "desc" },
//   });
//
// export type GetActivityFeedResult = Prisma.PromiseReturnType<
//   typeof getActivityFeed
// >;
//
// const employerSelect: Pick<
//   Prisma.CorporationSelect,
//   "path" | "hasTeamsIntegration"
// > = {
//   path: true,
//   hasTeamsIntegration: true,
// };
//
// export type GetEmployerByUserIdResult = Prisma.PromiseReturnType<
//   typeof getEmployerByUserId
// >;
//
// export const getEmployerByUserId = async (id: number) => {
//   const me = await prisma.user.findFirst({
//     where: { id },
//     select: {
//       employer: {
//         select: employerSelect,
//       },
//     },
//   });
//
//   return me?.employer;
// };
//
// export const getEmployerPathByUserId = async (id: number) => {
//   const me = await prisma.user.findUnique({
//     where: { id },
//     select: {
//       employer: {
//         select: {
//           path: true,
//         },
//       },
//     },
//   });
//
//   return me?.employer?.path;
// };
//
// export type GetEmployerPathByUserIdResult = Prisma.PromiseReturnType<
//   typeof getEmployerPathByUserId
// >;
//
// export const getEmployeeProfileCompleteByUserId = async (id: number) => {
//   return prisma.user.findFirst({
//     where: { id },
//     select: {
//       employeeProfileComplete: true,
//       employeeProfileCompleteDate: true,
//     },
//   });
// };
//
// export type GetEmployeeProfileCompleteByUserIdResult = Prisma.PromiseReturnType<
//   typeof getEmployeeProfileCompleteByUserId
// >;
//
// export type GetEmployeesSearchParameters = PaginatedSearchParams & {
//   path: string;
//   searchText?: string;
//   hsgTeam?: HSGTeamType | "NO_TEAM";
// };
//
// // export const getEmployees = async ({
// //   path,
// //   searchText,
// //   hsgTeam,
// //   page = 0,
// //   pageSize = DEFAULT_PAGE_SIZE,
// // }: GetEmployeesSearchParameters) => {
// //   const where: Prisma.UserWhereInput = {
// //     employer: { path },
// //   };
// //
// //   if (hsgTeam) {
// //     where.hsgTeam = hsgTeam === "NO_TEAM" ? null : hsgTeam;
// //   }
// //
// //   if (searchText) {
// //     where.OR = [
// //       { fullname: { contains: searchText } },
// //       { email: { contains: searchText } },
// //     ];
// //   }
// //
// //   const employeePromise = prisma.user.findMany({
// //     where,
// //     select: EmployeeInfoSelect,
// //     skip: page * pageSize,
// //     take: pageSize,
// //   });
// //
// //   const totalItemsPromise = prisma.user.count({ where });
// //
// //   const [employees, totalItems] = await Promise.all([
// //     employeePromise,
// //     totalItemsPromise,
// //   ]);
// //
// //   const totalPages = Math.ceil(totalItems / pageSize);
// //   const nextPage = page + 1 < totalPages ? page + 1 : null;
// //
// //   return {
// //     results: employees,
// //     totalItems,
// //     totalPages,
// //     nextPage,
// //   };
// // };
//
// export type GetEmployeesResult = Prisma.PromiseReturnType<typeof getEmployees>;
//
// export type ManageEmployeeArgs = {
//   profileImage: string;
//   firstName?: string;
//   lastName?: string;
//   employeeId: string;
//   hsgTeam?: HSGTeamType;
//   departmentId?: number;
//   country?: string;
// };
//
// export const manageEmployee = async (
//   userId: number,
//   {
//     profileImage,
//     firstName,
//     lastName,
//     employeeId,
//     hsgTeam,
//     departmentId,
//     country,
//   }: ManageEmployeeArgs
// ) => {
//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       hsgTeam: true,
//     },
//   });
//
//   //If the user already has a team, we don't allow to change it
//   if (user.hsgTeam && hsgTeam) {
//     throw new Error("User already has a team");
//   }
//
//   return prisma.user.update({
//     where: { id: userId },
//     data: {
//       profileImage: profileImage,
//       firstname: firstName,
//       lastname: lastName,
//       fullname: buildFullName({ firstName, lastName }),
//       hsgTeam,
//       // department: departmentId ? { connect: { id: departmentId } } : undefined,
//       country,
//     },
//     select: EmployeeInfoSelect,
//   });
// };
//
// export type ManageEmployeeResult = Prisma.PromiseReturnType<
//   typeof manageEmployee
// >;
//
// export const getDisplayNameByUserId = async (id: number) => {
//   const me = await prisma.user.findUnique({
//     where: { id },
//     select: {
//       firstname: true,
//       lastname: true,
//     },
//   });
//
//   return (
//     buildFullName({ firstName: me.firstname, lastName: me.lastname }) || null
//   );
// };
//
// export type GetDisplayNameByUserIdResult = Prisma.PromiseReturnType<
//   typeof getDisplayNameByUserId
// >;
//
// export const getHsgTeamByUserId = async (id: number) => {
//   const user = await prisma.user.findUnique({
//     where: { id },
//     select: {
//       firstname: true,
//       hsgTeam: true,
//       hsgTeamModalSeen: true,
//       languagePreference: true,
//     },
//   });
//   return user ?? null;
// };
//
// export type GetHsgTeamByUserIdResult = Prisma.PromiseReturnType<
//   typeof getHsgTeamByUserId
// >;
//
// export const markHsgTeamModalSeen = async (userId: number) => {
//   return firstLogin(userId);
//
//   // await prisma.$transaction(async (prisma) => {
//   //   const hasLoginActivityPromise = prisma.post.findFirst({
//   //     where: {
//   //       userId: userId,
//   //       activity: { isGeneralActivity: true }
//   //     }
//   //   });
//   //
//   //   const userUpdatePromise = prisma.user.update({
//   //     where: { id: userId },
//   //     data: {
//   //       hsgTeamModalSeen: true
//   //     }
//   //   });
//   //
//   //   const [hasLoginActivity, userUpdate] = await Promise.all([
//   //     hasLoginActivityPromise,
//   //     userUpdatePromise
//   //   ]);
//   //
//   //   const community = await prisma.community.findFirst({
//   //     where: {
//   //       hsgTeam: userUpdate.hsgTeam
//   //     }
//   //   });
//   //
//   //   const userIsTeamMember = await prisma.userEmployeeResourceGroup.count({
//   //     where: {
//   //       userId: userId,
//   //       ergId: community.id
//   //     }
//   //   }) > 0;
//   //
//   //   if (!userIsTeamMember) {
//   //     await prisma.userEmployeeResourceGroup.create({
//   //       data: {
//   //         user: {
//   //           connect: {
//   //             id: userId
//   //           }
//   //         },
//   //         erg: {
//   //           connect: {
//   //             id: community.id
//   //           }
//   //         },
//   //         status: UserEmployeeResourceGroupStatus.MEMBER
//   //       }
//   //     });
//   //   }
//   //
//   //   if (!hasLoginActivity) {
//   //     await prisma.post.create({
//   //         data: {
//   //           type: PostType.ACTIVITY,
//   //           content: {
//   //             submission: "",
//   //             photos: [],
//   //             isLogin: true
//   //           },
//   //           user: {
//   //             connect: {
//   //               id: userId
//   //             }
//   //           },
//   //           postAs: PostAs.USER,
//   //           visibleOnCorporation: {
//   //             connect: {
//   //               path: "henry-schein-games"
//   //             }
//   //           },
//   //           visibleOnErg: {
//   //             connect: { id: community.id }
//   //           },
//   //           status: PostStatus.APPROVED,
//   //           activity: {
//   //             connect: {
//   //               id: "35"
//   //             }
//   //           }
//   //         }
//   //       }
//   //     );
//   //   }
//   // });
//   //
//   // return true;
// };
//
// const firstLogin = async (userId: number) => {
//   await prisma.$transaction(
//     async (prisma) => {
//       const hasLoginActivityPromise = prisma.post.count({
//         where: {
//           userId: userId,
//           activity: { id: SYSTEM_ACTIVITY_ID.FIRST_SIGNED_UP },
//         },
//       });
//
//       const hasLeaderboardPromise = prisma.userLeaderboard.count({
//         where: {
//           userId: userId,
//         },
//       });
//
//       const userUpdatePromise = prisma.user.update({
//         where: { id: userId },
//         data: {
//           hsgTeamModalSeen: true,
//           hsgTeamModalSeenDate: new Date()
//         },
//       });
//
//       const [hasLoginActivity, hasLeaderboard, userUpdate] = await Promise.all([
//         hasLoginActivityPromise,
//         hasLeaderboardPromise,
//         userUpdatePromise,
//       ]);
//
//       const community = await prisma.community.findFirst({
//         where: {
//           hsgTeam: userUpdate.hsgTeam,
//         },
//         select: {
//           id: true,
//           corporation: { select: { path: true } },
//         },
//       });
//
//       const userIsTeamMember =
//         (await prisma.userCommunity.count({
//           where: {
//             userId: userId,
//             communityId: community.id,
//           },
//         })) > 0;
//
//       if (!userIsTeamMember) {
//         await prisma.userCommunity.create({
//           data: {
//             user: {
//               connect: {
//                 id: userId,
//               },
//             },
//             community: {
//               connect: {
//                 id: community.id,
//               },
//             },
//             status: UserCommunityStatus.MEMBER,
//           },
//         });
//       }
//
//       if (!hasLeaderboard) {
//         await createUserLeaderboard(userId, prisma);
//       }
//
//       if (!hasLoginActivity) {
//         await prisma.post.create({
//           data: {
//             type: PostType.ACTIVITY,
//             content: {
//               isLogin: true,
//             },
//             user: {
//               connect: {
//                 id: userId,
//               },
//             },
//             postAs: PostAs.USER,
//             visibleOnCorporation: {
//               connect: {
//                 path: community.corporation.path,
//               },
//             },
//             visibleOnCommunity: {
//               connect: { id: community.id },
//             },
//             status: PostStatus.APPROVED,
//             activity: {
//               connect: {
//                 id: SYSTEM_ACTIVITY_ID.FIRST_SIGNED_UP,
//               },
//             },
//           },
//         });
//       }
//     },
//     { timeout: 20000, maxWait: 20000 }
//   );
//
//   return true;
// };
//
// export const updateUserProfileImage = async (id, profileImage) => {
//   return prisma.user.updateMany({
//     where: {
//       id,
//     },
//     data: {
//       profileImage,
//     },
//   });
// };
//
// export type UpdateUserProfileImageResult = Prisma.PromiseReturnType<
//   typeof updateUserProfileImage
// >;
//
// export const updateUserLanguagePreference = async (id, language) => {
//   return prisma.user.update({
//     where: {
//       id,
//     },
//     data: {
//       languagePreference: language,
//     },
//   });
// };
//
// export type UpdateUserLanguagePreferenceResult = Prisma.PromiseReturnType<
//   typeof updateUserLanguagePreference
// >;
//
// export const importMembers = async (payload: any) => {
//   const userEmails = (
//     await prisma.user.findMany({
//       select: {
//         email: true,
//       },
//     })
//   ).map((x) => x.email.toLowerCase());
//
//   const usersToImport = payload.filter((p) => {
//     if (
//       p.First !== "" &&
//       p.Email?.length &&
//       !userEmails.includes(p.Email.toLowerCase())
//     ) {
//       return p;
//     }
//   });
//
//   const importedUsersResponse = await prisma.user.createMany({
//     data: usersToImport.map((u) => {
//       return {
//         firstname: u.First,
//         lastname: u.Last,
//         fullname: buildFullName({
//           firstName: u.First,
//           lastName: u.Last,
//         }),
//         email: u.Email,
//         username: u.Email,
//         country: u.State,
//         businessDivision: u.Division,
//         businessUnit: u.BusinessUnit,
//         onboardingCompleted: true,
//         hsgTeam:
//           u.Team === "Team Esther"
//             ? HSGTeamType.TEAM_ESTHER
//             : HSGTeamType.TEAM_HENRY,
//         role: "USER",
//         status: 0,
//         provider: "NONE",
//         employerId: 1,
//         identityVerified: true,
//       };
//     }),
//   });
//   const importedUsersCount = importedUsersResponse.count;
//   return importedUsersCount;
// };
//
// export const getAllEmployees = async () => {
//   return prisma.user.findMany({
//     where: {
//       employer: { path: "henry-schein-games" },
//     },
//     select: {
//       email: true,
//     },
//   });
// };
//
// export type GetAllEmployeesResult = Prisma.PromiseReturnType<
//   typeof getAllEmployees
// >;
