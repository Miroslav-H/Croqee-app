const jwt = require('jsonwebtoken');
import config from '../../config';
import { iJoinedUser, iModel } from './interfaces';
import { stillLifeModels } from './stillLifeModels';
import { anatomyModels } from './anatomyModels';

require('../../db/models').connect(config.dbUri);
const User = require('mongoose').model('User');
const ScoreRepo = require('../../db/repositories/scoreRepo');

export class drawingCompetitionController {
	private drawingField: string;
	constructor(io: any, node_client: any, drawingField: string) {
		this.drawingField = drawingField;
		this.resetStillLife();
		this.stillLifeloop(io);
		this.trackEachUser(io, node_client);
	}

	private players: iJoinedUser[] = [];
	private models: iModel[] = [];
	private lastDrawnModel: string;
	private round: number;
	private isBeginProcessed: boolean;
	private isBeginCallbackSent: boolean;
	private hasToBeResetAsUsersLeave: boolean;
	private numOfUsersGotScored: number;

	private findWithAttr(array: Array<any>, attr: string, value: string) {
		for (var i = 0; i < array.length; i += 1) {
			if (array[i][attr] === value) {
				return i;
			}
		}
		return -1;
	}
	private resetStillLife() {
		if (this.drawingField === 'still_life') {
			this.models = stillLifeModels;
		} else if(this.drawingField === 'anatomy'){
			this.models = anatomyModels;
		}
		this.round = 1;
		this.isBeginProcessed = false;
		this.isBeginCallbackSent = false;
		this.hasToBeResetAsUsersLeave = false;
		this.numOfUsersGotScored = 0;
	}
	private stillLifeLastUpdateTime: any;
	private getNumberOfPlayingUsers(users: Array<iJoinedUser>) {
		return users.filter((u) => u.status === 'playing').length;
	}

	//Still Life game loop
	private stillLifeloop(io: any) {
		setInterval(() => {
			if (this.players.length != 0) {
				!this.hasToBeResetAsUsersLeave ? (this.hasToBeResetAsUsersLeave = true) : '';
				if (this.isBeginProcessed) {
					var currentTime = new Date().getTime();
					var timeDifference = currentTime - this.stillLifeLastUpdateTime;
					timeDifference = Math.round(timeDifference / 1000);
					if (this.models[this.round - 1].givenTime <= timeDifference) {
						this.isBeginProcessed = false;
						io.sockets.emit('send_your_drawing');
						this.lastDrawnModel = this.models[this.round - 1].model;
						this.round++;
						if (this.round > this.models.length) {
							this.round = 1;
						}
					}
				} else {
					if (
						this.numOfUsersGotScored >= this.getNumberOfPlayingUsers(this.players) ||
						this.players.length == 1
					) {
						if (!this.isBeginCallbackSent) {
							this.isBeginCallbackSent = true;
							io.sockets.emit('join_club', this.models[this.round - 1]);
							this.players = this.players
								? this.players.sort((a: iJoinedUser, b: iJoinedUser) => {
										return b.score - a.score;
									})
								: [];
							setTimeout(() => {
								if (!this.isBeginProcessed) {
									io.sockets.emit('users_score', this.players);
								}
							}, 2500);
							setTimeout(() => {
								if (!this.isBeginProcessed) {
									io.sockets.emit('start_drawing', this.models[this.round - 1]);
									this.isBeginCallbackSent = false;
									this.isBeginProcessed = true;
									this.setNumberofUsersGotScoredToZero();
									this.stillLifeLastUpdateTime = new Date().getTime();
								}
							}, 7000);
						}
					}
				}
			} else if (this.hasToBeResetAsUsersLeave) {
				// reset every thing to defualt
				this.resetStillLife();
				this.hasToBeResetAsUsersLeave = false;
			}
		}, 80);
	}
	private trackEachUser(io: any, node_client: any) {
		io.on('connection', (socket: any) => {
			let joinedUser: iJoinedUser;

			socket.on('username', (token: string) => {
				jwt.verify(token, config.jwtSecret, (err: any, decoded: any) => {
					if (!err) {
						const userId = decoded.sub;
						return User.findById(userId, (userErr: any, user: any) => {
							if (!userErr && user) {
								let userIsNotAlreadyJoined =
									this.players.filter((u: iJoinedUser) => u._id == user._id).length == 0;
								if (userIsNotAlreadyJoined) {
									joinedUser = {
										_id: user._id,
										name: user.name,
										status: 'recently joined',
										score: 0
									};
									this.players.push(joinedUser);
									io.sockets.emit('update_user', this.players);
       
									//Invoking my_drawing after the user is verified
									socket.on('my_drawing', (dataURL: string) => {
										let _score: number = 0;
										if (dataURL != null) {
											let param = {
												dataURL: dataURL,
												model: this.lastDrawnModel
											};
											node_client.invoke(
												'DrawingDistance',
												param,
												(error: any, res2: any, more: any) => {
													const result = JSON.parse(res2);
													_score = Math.floor(result.score);
													socket.emit('evaluated_score', { score: _score, img: result.img });
													this.increaseNumberOfUsersGotScored();

													let _index = this.findWithAttr(this.players, '_id', joinedUser._id);
													joinedUser.score = _score;
													joinedUser.status == 'recently joined'
														? (joinedUser.status = 'playing')
														: '';
													this.players[_index] = joinedUser;
													io.sockets.emit('update_user', this.players);

													ScoreRepo.updateUserScore(joinedUser._id, this.models[this.round - 1].model, _score);

												}
											);
										} else {
											socket.emit('evaluated_score', { score: _score, img: null });
											this.increaseNumberOfUsersGotScored();

											let _index = this.findWithAttr(this.players, '_id', joinedUser._id);
											joinedUser.score = _score;
											joinedUser.status == 'recently joined'
												? (joinedUser.status = 'playing')
												: '';
											this.players[_index] = joinedUser;
											io.sockets.emit('update_user', this.players);
										}
									});
								}
							}
						});
					}
				});
			});

			socket.on('disconnect', () => {
				this.players = this.players.filter((u: iJoinedUser) => u._id != joinedUser._id);
				io.sockets.emit('update_user', this.players);
			});
		});
	}
	private increaseNumberOfUsersGotScored() {
		this.numOfUsersGotScored++;
	}
	private setNumberofUsersGotScoredToZero() {
		this.numOfUsersGotScored = 0;
	}
}
