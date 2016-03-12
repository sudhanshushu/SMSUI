import {Dispatcher} from 'flux';
import assign from 'react/lib/Object.assign';

let AppDispatcher = assign(new Dispatcher(), {
	handleViewAction: function(action) {
		this.dispatch({
		  type: 'LOGIN_VALIDATE',
		  data: action
		});
	}
	
});

export default AppDispatcher;