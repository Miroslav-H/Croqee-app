import React, { Component } from 'react';

class EmptyTimer extends Component {
	constructor(props) {
		super(props);

		this.state = {
			timerColor: 'timer_green'
		};
	}
	render() {
		return (
			<React.Fragment>
				<svg width="100" height="100" viewbox="0 0 150 150">
					<path
						id="loader"
						className={this.state.timerColor}
						ref="loader"
						transform="translate(50, 50) scale(.400)"
					/>
				</svg>
				<span className="takeabreak">Take a break!</span>
			</React.Fragment>
		);
	}
}

export default EmptyTimer;
