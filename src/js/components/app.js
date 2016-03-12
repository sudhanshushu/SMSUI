import React from 'react';
import Router from 'react-router-component';
import Helmet from 'react-helmet'
import _ from 'lodash';

import Header from './header';
import Navbar from './navbar';

import Login  from './login';
import Bookshelf from './bookshelf';
import BookPanel from './bookPanel';
import PDFPanel from './pdfPanel';
import DataFormatter from './utilities/dataFormatter';
import CustomMixins from './custommixin';

import AppActions from '../actions/app.actions';
import AppConstants from '../constants/app.constants';
import ErrorConstants from '../constants/error.constants';
import AppStore from '../stores/app.store';

var NavigateMixins = Router.NavigatableMixin;
var Locations = Router.Locations;
var Location = Router.Location;

CustomMixins.mixin(React.Component,NavigateMixins);

class App extends React.Component {

	state = {ErrorTxt:'',FontStyle:'errTxt'};

	componentDidMount(){
		var curpagepath = DataFormatter.getObjectInStorage('curpagepath');
		var curpageno   = DataFormatter.getObjectInStorage('curbookpageno');
		if(curpagepath !== null) {
		 	localStorage.removeItem('curpagepath');
		};
		window.addEventListener('unload', this.myunload);
	}

	componentWillMount() {
		if(window.localStorage){
			var storedpath = DataFormatter.getObjectInStorage('curpagepath');
			if(storedpath !== null) {
				this.navigate(storedpath);
			}else{
				if(DataFormatter.getKeyFromObject('userInformation','userToken') != null) {
					this.navigate('/bookshelf');
				}
			}
		}
		AppStore.on(AppConstants.EventTypes.LOGIN_VALIDATE_COMPLETE, this.postvalidation);
		AppStore.on(AppConstants.EventTypes.LOGIN_SUBMIT_COMPLETE, this.logincompletion);
		AppStore.on(AppConstants.EventTypes.GET_USER_COMPLETE, this.getUserCompleted);
		AppStore.on(AppConstants.EventTypes.USER_LOGOUT_COMPLETE, this.logoutCompleted);
		AppStore.on(AppConstants.EventTypes.BOOK_CLICKED, this.bookClicked);
		AppStore.on(AppConstants.EventTypes.BRAND_CLICKED, this.brandNameClicked);
	}

 	componentWillUnmount() {
    	window.removeEventListener('unload', this.myunload);
  	}

  	myunload = function(e){
  		DataFormatter.setObjectInStorage('curpagepath',window.location.pathname);
  		if(window.location.pathname=='readBook'){
  			var curbookpageno = this.sliderObj.getValue();
  			DataFormatter.setObjectInStorage('curbookpageno',curbookpageno);
  		}
  	}

	updateMessage = function(content,flag){
		if(flag=='success'){
			AppActions.getUser();
		}
		else if(flag === "logout")
		{
			this.setState({ErrorTxt:content,FontStyle:'greenTxt'});
		}
		else{
			this.setState({ErrorTxt: content,FontStyle:'errTxt'});
		}
	}

	render() {
		return (
			<div className='main'>
			<Locations path={this.props.path}>
			<Location  path="/"	handler={
				<div>
				<Helmet title={AppConstants.PageTitles.Login}/>
				<Header fontstyle={this.state.FontStyle} content={this.state.ErrorTxt} />
				<Login/>
				</div>
			}
			/>
			<Location  path="/bookshelf" handler=
			{
				<div>
				<Helmet title={AppConstants.PageTitles.Bookshelf}/>
				<Navbar/>
				<Bookshelf/>
				</div>
			} />
			<Location  path="/readBook" handler=
			{
				<div>
				<Helmet title={AppConstants.PageTitles.ReadBook}/>
				<Navbar/>
				<BookPanel/>
				</div>
			} />
			<Location  path="/readPDF" handler=
			{
				<div>
				<Helmet title={AppConstants.PageTitles.ReadBook}/>
				<Navbar/>
				<PDFPanel/>
				</div>
			} />
			</Locations>
			</div>
		);
	}

	postvalidation  = () => {
		let username = document.getElementById('username').value.trim();
		let password = document.getElementById('password').value.trim();
		if (!username && !password) {
			this.updateMessage(ErrorConstants.Login.NULL_CHECK_BOTH_MESSAGE);
		}
		else if (username && !password) {
			this.updateMessage(ErrorConstants.Login.NULL_CHECK_PASSWORD_MESSAGE);
		}
		else if (!username && password) {
			this.updateMessage(ErrorConstants.Login.NULL_CHECK_USERNAME_MESSAGE);
		}
		else {
			this.updateMessage('loader');
			AppActions.loginSubmit(username,password);
		};
	}
	logincompletion = () => {
		if(AppStore.response=='failed'){
			this.updateMessage(ErrorConstants.Login.FAILURE_MESSAGE);
		}
		else {
			this.updateMessage(ErrorConstants.Login.SUCCESS_MESSAGE,'success');
		}
	}
	getUserCompleted = () => {
		this.navigate('/bookshelf');
	}
	logoutCompleted = () => {
		this.navigate('/');
		var response = AppStore.response;
		this.updateMessage(response.message,response.action);
	}
	bookClicked = () => {
		var response = AppStore.response;
        //console.log('book response'+response);
        DataFormatter.setObjectInStorage('currentBook',response);
        var type = response.metadata.type;
        if(type == 'pdf'){
          this.navigate('/readPDF');	
        }else{
          this.navigate('/readBook');
        }
	}
	brandNameClicked = () => {
		var response = AppStore.response;
		this.navigate('/bookshelf');
	}
};
export default App;
