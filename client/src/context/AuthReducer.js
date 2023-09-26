const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        user: null,
        isFetching: true,
        error: false,
      };
    case "LOGIN_SUCCESS":
      return {
        user: action.payload,
        isFetching: false,
        error: false,
      };
    case "LOGIN_FAILURE":
      return {
        user: null,
        isFetching: false,
        error: true,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isFetching: false,
        error: false,
      };
    case "FOLLOW":
      return {
        ...state,
        user: {
          ...state.user,
          followings: [...state.user.followings, action.payload],
        },
      };
    case "UNFOLLOW":
      return {
        ...state,
        user: {
          ...state.user,
          followings: state.user.followings.filter(
            (following) => following !== action.payload
          ),
        },
      };
    case "INCREMENT_NOTIFICATIONS":
      return {
        ...state,
        notifications: state.notifications + 1,
      };
    // AuthReducer.js

    case "LIKE_POST":
      return {
        ...state,
        notifications: state.notifications + 1,
        user: {
          ...state.user,
          notifications: [
            ...state.user.notifications,
            {
              type: "like",
              userId: action.payload.userId,
              postId: action.payload.postId,
            },
          ],
        },
      };
    case "FOLLOW_USER":
      return {
        ...state,
        notifications: state.notifications + 1,
        user: {
          ...state.user,
          notifications: [
            ...state.user.notifications,
            {
              type: "follow",
              userId: action.payload.userId,
            },
          ],
        },
      };

    case "COMMENT_POST":
      return {
        ...state,
        notifications: state.notifications + 1,
        user: {
          ...state.user,
          notifications: [
            ...state.user.notifications,
            {
              type: "comment",
              userId: action.payload.userId,
              postId: action.payload.postId,
              commentId: action.payload.commentId,
            },
          ],
        },
      };
    case "FETCH_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload,
      };
    default:
      return state;
  }
};

export default AuthReducer;
