export const REDUCER = {
  SET_PUBLIC_KEY: "SET_PUBLIC_KEY",
};

function setPublicKey(state, action) {
  const { payload } = action;

  if (payload) {
    return {
      ...state,
      publicKey: payload,
    };
  }
  return state;
}

const Reducer = (state, action) => {
  const { payload } = action;
  console.log(action.type, payload);

  switch (action.type) {
    case REDUCER.SET_PUBLIC_KEY:
      return setPublicKey(state, action);
    default:
      return state;
  }
};

export default Reducer;
