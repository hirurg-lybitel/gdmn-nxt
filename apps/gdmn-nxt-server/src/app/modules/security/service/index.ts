const getSessionsById = async (userId, sessionStore, currentSessionId) => {
  const activeSessions = [];
  await sessionStore.all((err, sessions) => {
    if (!sessions) return [];
    const keys = Object.keys(sessions);
    for (const key of keys) {
      if (sessions[key].userId === userId) {
        activeSessions.push({
          id: sessions[key].id,
          location: sessions[key].location,
          device: sessions[key].device,
          creationDate: sessions[key].creationDate,
          current: sessions[key].id === currentSessionId
        });
      };
    }
  });
  return activeSessions;
};

const closeSessionBySessionId = async (sessionId, sessionStore) => {
  sessionStore.destroy(sessionId);
};

export const securityService = {
  getSessionsById,
  closeSessionBySessionId
};
