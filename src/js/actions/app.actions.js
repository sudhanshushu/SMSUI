import AppConstants from '../constants/app.constants';
import AppDispatcher from '../dispatchers/app.dispatcher';
import RequestHandler from '../components/requestHandler';
import DataFormatter from '../components/utilities/dataFormatter';
import assign from 'react/lib/Object.assign';

let ActionTypes = AppConstants.ActionTypes;
let reqHandler = new RequestHandler();
let requestParameters = {};
let headerParameters = {};

let AppActions = {

  getUser: function() {
    headerParameters= {
      'appId': AppConstants.AppID,
      'token': DataFormatter.getKeyFromObject("userInformation","userToken")
    }
    reqHandler.handleRequest(AppConstants.RequestTypes.get,AppConstants.APIBaseUrl + 'user',
    headerParameters,requestParameters,function(err, res){
      var userInformation = DataFormatter.getObjectInStorage("userInformation")
      assign(userInformation,res.body);
      DataFormatter.setObjectInStorage("userInformation",userInformation);
      AppDispatcher.dispatch({
        type : ActionTypes.GET_USER,
        data : res.body
      });
    })
  },
  loginValidate : function(e) {
    e.preventDefault();
    AppDispatcher.handleViewAction({
      funcname: 'postvalidation'
    });
  },
  loginSubmit : function(userName,password) {
    headerParameters= {
      'appId': AppConstants.AppID
    }
    requestParameters = {
      'username': userName,
      'password': password
    }
    reqHandler.handleRequest(AppConstants.RequestTypes.post,AppConstants.APIBaseUrl + 'authenticate',
    headerParameters,requestParameters,function(err, res) {
      let responseStatus = '';
      if(err) {
        responseStatus = 'failed';
      }
      else {
        var userInformation ={};
        userInformation.userToken = res.body.token;
        DataFormatter.setObjectInStorage("userInformation",userInformation);
        responseStatus = 'success';
      }
      AppDispatcher.dispatch({
        type : ActionTypes.LOGIN_SUBMIT,
        data : res.body,
        status:responseStatus
      });
    })
  },
  loadBookshelf: function() {
    let id, usertoken;
    if(window.localStorage) {
      id = DataFormatter.getKeyFromObject("userInformation","id");
      usertoken = DataFormatter.getKeyFromObject("userInformation","userToken");
    }
    else {
      id = 123;
      usertoken = 'ab123fc456gh78';
    }
    headerParameters=
    {
      'appId': AppConstants.AppID,
      'token': usertoken
    }
    reqHandler.handleRequest(AppConstants.RequestTypes.get,AppConstants.APIBaseUrl +'user/' + id + "/product",
    headerParameters,requestParameters,function(err, res){
      AppDispatcher.dispatch({
        type : ActionTypes.BOOKSHELF_LOAD,
        data : res.body
      });
    })
  },
  logoutUser: function(logoutType) {
    if(window.localStorage){
      localStorage.removeItem('userInformation');
      localStorage.removeItem('curpagepath');
      localStorage.removeItem('curbookpageno');
      localStorage.removeItem('currentBook');
    }
    reqHandler.handleRequest(AppConstants.RequestTypes.get,'/logout',
      headerParameters,requestParameters,function(err, res){
        AppDispatcher.dispatch({
          type : ActionTypes.LOGOUT_USER,
          data: logoutType
        });
    }) 
  },
  bookClicked: function(bookID) {
    //console.log('bookID'+bookID);
    reqHandler.handleRequest(AppConstants.RequestTypes.get,AppConstants.APIBaseUrl+'book/'+bookID,
    headerParameters,requestParameters,function(err, res){
      AppDispatcher.dispatch({
        type : ActionTypes.BOOK_CLICKED,
        data : res.body
      });
    })
  },
  bookHeaderItemClicked: function(itemClicked) {
    AppDispatcher.dispatch({
      type : ActionTypes.HEADER_ITEM_CLICKED,
      data: itemClicked
    });
  },
  brandNameClicked: function() {
    AppDispatcher.dispatch({
      type : ActionTypes.BRAND_CLICKED,
      data: null
    });
  },
  getBookHighlights : function(bookId, shouldReloadPage) {
    var userID = DataFormatter.getKeyFromObject("userInformation","id");
    var usertoken = DataFormatter.getKeyFromObject("userInformation","userToken");
    headerParameters=
    {
      'appId': AppConstants.AppID,
      'token': usertoken
    }
    reqHandler.handleRequest(AppConstants.RequestTypes.get,AppConstants.APIBaseUrl + 'highlight/source/' + bookId,
    headerParameters,null,function(err, res) {

      // Filter deleted highlights.
      var validHighlights = res.body.filter(function (highlight) {
        return highlight.status !== 'deleted'
      });
      var sortedHighlights = DataFormatter.sortNumbers(validHighlights, AppConstants.SortType.ASC, "pageIndex");
      AppDispatcher.dispatch({
        type : ActionTypes.GET_BOOK_HIGHLIGHTS,
        data : {sortedHighlights:sortedHighlights,shouldReloadPage: shouldReloadPage}
      });
    })
  },
  manageHighlight : function(highlightData) {
    var userID = DataFormatter.getKeyFromObject("userInformation","id");
    var usertoken = DataFormatter.getKeyFromObject("userInformation","userToken");
    headerParameters=
    {
      'appId': AppConstants.AppID,
      'token': usertoken
    }
    requestParameters ={
      'sourceId': highlightData.bookId,
      'sourceType':"highlight",
      'user': userID,
      'colour': highlightData.colour ? highlightData.colour:AppConstants.DefaultHighlightColor,
      'comment': highlightData.comment? highlightData.comment:' ',
      'highlightHash': highlightData.serializedHighlight,
      'highlightEngine': AppConstants.HighlightEngine,
      'pageId': highlightData.pageInformation.pageId,
      'pageIndex': highlightData.pageInformation.pageNumber
    }
    // handle different cases for create/delete/modify highlight.
    if(highlightData.selection) {
      requestParameters.note = highlightData.selection;
    }
    else {
      requestParameters.note = highlightData.note;
    }
    // If the highlight is marked for deletion, then set the status here.
    if(highlightData.shouldDeleteHighlight) {
      requestParameters.status = 'deleted';
    }
    if(highlightData.isNewHighlight) {
    reqHandler.handleRequest(AppConstants.RequestTypes.post,AppConstants.APIBaseUrl + 'highlight',
    headerParameters,requestParameters,function(err, res) {
      // Refresh the book panel.
      var bookId = DataFormatter.getKeyFromObject("currentBook","id");
      AppActions.getBookHighlights(bookId);

    },"application/x-www-form-urlencoded")
  }
  else {
    reqHandler.handleRequest(AppConstants.RequestTypes.put,AppConstants.APIBaseUrl + 'highlight/' + highlightData.id,
    headerParameters,requestParameters,function(err, res) {
      // Refresh the book panel.
      var bookId = DataFormatter.getKeyFromObject("currentBook","id");
      AppActions.getBookHighlights(bookId, highlightData.shouldDeleteHighlight);

    },"application/x-www-form-urlencoded")
  }
}
};
export default AppActions;
