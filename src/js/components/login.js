import React from 'react';
import AppActions from '../actions/app.actions';
import AppStore from '../stores/app.store';
import AppConstants from '../constants/app.constants';

class LoginForm extends React.Component {

  render() {
    return (
		<div className="wrapper">
				<div className="loginContainer">
					<div className="titleLogo">
            <image src="assets/images/readerplus_logo_medium.png" width="529" height="152"/>
					</div>
					<div id="formContainer" className="formcontrol">
						<form id="loginForm" onSubmit={this.validate}>	
							<div>
								<input type="text"  id="username" name="username" placeholder="Username"/>
							 </div>
							 <div>
								<input type="password"  id="password" name="password" placeholder="Password"/>
							 </div>
							 <div>
								<button className="btn-lg" type="submit">Log In</button>
							 </div>				
						</form>	  
					</div>
				</div>	
		</div>			
    );
  }
  
  validate = function(e){
	  AppActions.loginValidate(e);
  }

};

export default LoginForm;





