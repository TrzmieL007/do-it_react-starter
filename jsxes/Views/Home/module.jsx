import React from 'react';

class Modules extends React.Component {
    constructor(props){
        super(props);
        // this.listOfModules = null;
        // this.moduleInfo = null;
        // this.getListOfModules();
        // if(props.params.id) this.getModule();
    }
    /*shouldComponentUpdate(nextProps, nextState){
        this.getListOfModules();
        if(nextProps.params.id) this.getModule(nextProps.params.id);
        return true;
    }
    getModule(id){
        this.moduleInfo = null;
        $.get('http://localhost:8080/doItAPI/modules',{
            clientCode : this.props.appState.client.clientCode.toLowerCase(),
            id: id || this.props.params.id
        },(res)=>{
            this.moduleInfo = <pre>{JSON.stringify(res,null,4)}</pre>;
            this.forceUpdate();
        });
    }*/
    render(){
        return <div className="row">
            {/* Tu menu boczne */}
            {/*this.listOfModules*/}
            {this.props.sideMenu}
            <div className="col-sm-8 col-md-8 col-lg-9">
                <div className="tab-content">
                    {/* Here goes content of the module */}
                    {/*this.moduleInfo*/}
                    {this.props.content}
                </div>
            </div>
        </div>;
    }
}

// export default AdvancedTools;
module.exports = Modules;