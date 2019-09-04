import axios from 'axios';
import config from '../../modules/config';
import {
	SET_USER,
	GET_USER_ASYNC,
	AUTHENTICATE,
	SET_TIMER,
	SHOW_SCORE,
	HIDE_SCORE,
	SET_IMAGE_PROCESSING,
	SET_HAND_SIDE,
	SET_TIMER_DONE
} from './action-types';

//Get User

export function getUserAsync(payload) {
	return { type: GET_USER_ASYNC, user: payload.user };
}
export function getUser() {
	return (dispatch) => {
		let AuthorizationHeader = config.AuthorizationHeader();

		axios.get('/api/getuser', AuthorizationHeader).then((response) => {
			dispatch(authenticate(true));
			let user = response.data;
			dispatch(getUserAsync(user));
		});
	};
}

//Set User
export function setUser(payload) {
	return { type: SET_USER, user: payload };
}
export function authenticate(payload) {
	return { type: AUTHENTICATE, isAuthenticated: payload };
}

//Timer
export function setTimer(payload) {
	return { type: SET_TIMER, showTimer: payload };
}
export function setTimerDone(payload) {
	return { type: SET_TIMER_DONE, done: payload };
}

//Invoke Score
export function invokeScore(payload) {
	return (dispatch) => {
		dispatch(showScore(payload));
		setTimeout(() => {
			dispatch(hideScore());
			setTimeout(() => {
				dispatch(setTimer(true));
				dispatch(setTimerDone(false));
			}, 1000);
		}, 5000);
	};
}
export function showScore(payload) {
	return { type: SHOW_SCORE, score: payload };
}
export function hideScore() {
	return { type: HIDE_SCORE };
}

//Set Image Processing
export function setImageProcessing(payload) {
	return { type: SET_IMAGE_PROCESSING, imageProcessing: payload };
}

export function setHandSide(payload) {
	return { type: SET_HAND_SIDE, side: payload };
}
