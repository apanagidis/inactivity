const UPDATE_LAST_MESSAGE = "UPDATE_LAST_MESSAGE";
const GET_LAST_MESSAGE ="GET_LAST_MESSAGE";

const initialState = {
  activeChats: [],
};

const state = { 
  activeChats: [],
}

export class Actions {

  static updateLastMessage = (selectedValues) => ({
    type: UPDATE_LAST_MESSAGE,
    payload: selectedValues,
  });

  static getLastMessage = () => ({
    type: GET_LAST_MESSAGE
  })

}

export function reduce(state = initialState, action) {
  // eslint-disable-next-line sonarjs/no-small-switch
  switch (action.type) {
    case UPDATE_LAST_MESSAGE: {
      return { ...state, activeChats: action.payload }

    }
    case GET_LAST_MESSAGE: {
      return state.activeChats;
    }

    default:
      return state;
  }
}

