import React from 'react';
import IndexComponent from '../Classes/IndexComponent';

// import $ from '../../../statics/js/ajax';

class Index extends IndexComponent {
    constructor(props){
        super(props);
    }
    /*getsthdromAPI(endpoint){
        $.setAuthenticate(true);
        $.ajax({
            authenticate: 1,
            method: 'GET',
            url: 'http://doitwebapitest.azurewebsites.net/api/2.0/'+endpoint,
            done: d => console.log("done %o, arguments %o",d,arguments)
        });
    }*/
    renderContent(){
        return <div className="container">
            {this.props.children}
        </div>;
    }
}

module.exports = Index;
