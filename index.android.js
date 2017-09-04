/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  ListView,
  AppRegistry,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  Linking,
  TouchableWithoutFeedback
} from 'react-native';
import ModalWrapper from 'react-native-modal-wrapper';
import {SmoothLine} from 'react-native-pathjs-charts';
import ActionButton from 'react-native-action-button';
import Icon from 'react-native-vector-icons/Ionicons';

export default class fizica_android extends Component {

  input_data = [];
ws = null;
 STATIC_URL = 'ws://unitbv-physics.mailo.ml:24596/';

round_and_abs(e){ 
   return Math.round(Math.abs(e.t1-e.t2)*100)/100;
}
   constructor() {
    super();
    const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
    this.state = {
      dataSource: ds.cloneWithRows(this.input_data),
      input_voltage:'',
      voltageDialog:false,
      temp1 : 0,
      temp2 : 0,
      data:[[{"x":0,"y":0},{"x":0.1,"y":0}]],
      show_table:false,
    };


      ws = new WebSocket(this.STATIC_URL);
      ws.onopen = () => {
        // connection opened
       // console.log("opened")
        ws.send('get_table'); 
      };

      ws.onmessage = (e) => {
        // a message was received
        try{
        var data = JSON.parse(e.data)
        console.log("on message received:", data)
        if(typeof data.table !='undefined'){
          this.input_data = data.table;  
                  console.log("this.input_data",this.input_data);
                  let data_cp = [[]];
                  for(let i=0;i<this.input_data.length;i++){
                      data_cp[0].push({"x":this.round_and_abs(this.input_data[i]),"y":parseInt(this.input_data[i].v)})
                  }
           const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});  
                  this.setState({ 
                    dataSource: ds.cloneWithRows(this.input_data)
                  })

                  if(this.input_data.length>1) 
                  this.setState({ 
                    data:data_cp
                  })
                  
        }
          if(typeof data.t1!='undefined'){
            this.setState({temp1:data.t1})
          }
          if(typeof data.t2!='undefined'){
            this.setState({temp2:data.t2})
          }
          if(typeof data.t1!='undefined'&&typeof data.t2!='undefined'){
            if(Math.floor(Math.abs(data.t1-data.t2))%5==0 && this.search_interval(Math.abs(data.t1-data.t2))){
              this.input_data.push({
                t1:Math.floor(data.t1*100)/100,t2:Math.floor(data.t2*100)/100,v:0
              })
              console.log("Pushed data: ",{
                t1:Math.floor(data.t1*100)/100,t2:Math.floor(data.t2*100)/100,v:0
              })
               const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});    
                this.setState({
                    dataSource: ds.cloneWithRows(this.input_data)
                  })  
               let data_cp = this.state.data;

                data_cp[0].push({"x":this.round_and_abs(this.input_data[this.input_data.length]),"y":parseInt(this.input_data[this.input_data.length].v)});

             
              this.setState({
                    data:data_cp,
              })   
                  
                                
                                   
            }
          }

          if(typeof data.set_v!='undefined'){
          for(let i=0;i<this.input_data.length;i++){
            if(this.input_data[i].t1 == data.set_v.t1 && this.input_data[i].t2 == data.set_v.t2){
             this.input_data[i].v = data.set_v.v;
              const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});    
            
                 // console.log("data updated ",)
                 let data_cp = this.state.data;
                    (data_cp[0])[i].y = data.set_v.v;
                   this.setState({
                    dataSource: ds.cloneWithRows(this.input_data),
                  })
                  this.setState({
                     data:data_cp
                  })

                   
           
            }
          }
        }
        }catch(ex){
          console.log('parse json exception',ex,e.data);
        }

      };

      ws.onerror = (e) => {
        // an error occurred
        console.log(e.message);
       // ws.open(this.STATIC_URL)
      };

      ws.onclose = (e) => {
        // connection closed
        console.log(e);
       // ws.open(this.STATIC_URL)
      };
  };

  search_interval(int){
    console.log("search interval ",int)
    for(let i=0;i<this.input_data.length;i++){
     // console.log(Math.floor(Math.abs(this.input_data[i].t1-this.input_data[i].t2)))
      if(Math.floor(Math.abs(this.input_data[i].t1-this.input_data[i].t2))==Math.floor(int)){

    console.log("search interval false",int,Math.floor(Math.abs(this.input_data[i].t1-this.input_data[i].t2)),Math.floor(int),this.input_data)
      return false;
      }
    }
    console.log("search interval true",int)
    return true;
  }



active_elm = null;
active_index = -1;

itemClick(elm,i){
  this.active_elm = elm;
  this.active_index = i;
  this.setState({voltageDialog:true});
  this.setState({input_voltage:this.active_elm.v});

};
onSubmitVoltage(){
 //debugger;
 this.input_data[this.active_index].v = this.state.input_voltage;

 const ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});    
 
  //  console.log((this.state.data[0])[parseInt(this.active_index)].y)
   // ((this.state.data[0])[parseInt(this.active_index)]).y = parseInt(this.state.input_voltage);
   let copy = this.state.data;
try{
   ((copy[0])[parseInt(this.active_index)]).y = parseInt(this.state.input_voltage);

}catch(ex){
  console.log("Exception set voltage: ",ex,copy[0],parseInt(this.active_index),((copy[0])[parseInt(this.active_index)]))
}

this.setState({
      dataSource: ds.cloneWithRows(this.input_data),
      voltageDialog:false,
      data:copy
    })

  this.active_elm = null;

  ws.send(JSON.stringify({set_v:this.input_data[this.active_index]})); 
};







 render() {


  let options = {
    width: 340,
    height: 220,
    color: '#2980B9',
    margin: {
      top: 20,
      left: 45,
      bottom: 25,
      right: 20
    },
    animate: {
      type: 'delayed',
      duration: 200
    },
    axisX: {
      showAxis: true,
      showLines: true,
      showLabels: true,
      showTicks: true,
      zeroAxis: false,
      orient: 'bottom',
      label: {
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: true,
        fill: '#34495E'
      }
    },
    axisY: {
      showAxis: true,
      showLines: true,
      showLabels: true,
      showTicks: true,
      zeroAxis: false,
      orient: 'left',
      label: {
        fontFamily: 'Arial',
        fontSize: 14,
        fontWeight: true,
        fill: '#34495E'
      }
    }
  }

    return (
      <View style={styles.container}>
        
<ActionButton buttonColor="rgba(231,76,60,1)">
          <ActionButton.Item buttonColor='#9b59b6' title="Toggle graph" onPress={() => this.setState({show_table:!this.state.show_table})}>
            <Icon name="md-stats" style={styles.actionButtonIcon} />
          </ActionButton.Item>
          <ActionButton.Item buttonColor='#3498db' title="Help" onPress={() => {
            Linking.openURL('https://iosifnicolae.com/blog/unitbv-physics-help/').catch(err => console.error('An error occurred', err));
}}>
            <Icon name="md-help" style={styles.actionButtonIcon} />
          </ActionButton.Item>
        </ActionButton>

        <ModalWrapper
    onRequestClose={this.onCancel}
    style={{ width: 280, height: 180, paddingLeft: 24, paddingRight: 24 }}
    visible={this.state.voltageDialog}>
      <Text style={{ fontSize: 18}}>Introduceti tensiunea {this.active_index>=0&&(this.active_index+1)} ΔT={this.active_elm!=null&&Math.round(Math.abs(this.active_elm.t1-this.active_elm.t2)*100)/100}:</Text>
      <TextInput
      style={{marginBottom:10}}
          autoFocus={true}
          value={this.state.input_voltage.toString()}
          keyboardType='numeric'
          onChangeText={(input_voltage) => this.setState({input_voltage})}
          placeholder="1.71" />
            <Button          
            onPress={this.onSubmitVoltage.bind(this)}
            title="Salveaza"
            color="#4caf50"
            accessibilityLabel="Salveaza tensiunea."
          />
    </ModalWrapper>

    

        <View style={styles.temp_header}>
          <Text style={styles.temp1}>
            T1:{"\n"}
            {Math.round(this.state.temp1*100)/100}°C
          </Text>
          <Text style={styles.delta_temp}>
            ΔT:{"\n"}
            {Math.round(Math.abs(this.state.temp1-this.state.temp2)*100)/100}
          </Text>
          <Text style={styles.temp2}>
            T2:{"\n"}
            {Math.round(this.state.temp2*100)/100}°C
          </Text>
        </View>

        <View style={!this.state.show_table ? {position:'absolute',top: -600,alignItems: 'center',} : {alignItems: 'center',}}>
          <SmoothLine data={this.state.data} options={options} xKey='x' yKey='y' />
        </View> 

        <View >
          <View style={styles.row_container_header}>
            <Text style={styles.row_child_index_head}>Nr.</Text>
            <Text style={styles.row_child_head}>T1</Text>
            <Text style={styles.row_child_head}>T2</Text>
            <Text style={styles.row_child_head}>ΔT</Text>
            <Text style={styles.row_child_head}>V</Text>
          </View>
        </View>

      <View style={styles.table_container_wrapper}>
            <ListView
              style={styles.table_container} 
             enableEmptySections={true}
              dataSource={this.state.dataSource}
              renderRow={(rowData,section_id,row_id) => 
              
              <TouchableWithoutFeedback onPress={ () => {
                this.itemClick(rowData,row_id)
                } }>
                <View style={styles.row_container} >
                  <Text style={styles.row_child_index}>{(parseInt(row_id)+1)}</Text>
                  <Text style={styles.row_child}>{rowData.t1}</Text>
                  <Text style={styles.row_child}>{rowData.t2}</Text>
                  <Text style={styles.row_child}>{Math.floor(Math.abs(rowData.t1-rowData.t2)*100)/100}</Text>
                  <Text style={styles.row_child}>{rowData.v}</Text>
                </View>
              </TouchableWithoutFeedback>}
            />
      </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
   actionButtonIcon: {
    fontSize: 20,
    height: 22,
    color: 'white',
  },
  container: {
    flex:1,
  },
  temp_header:{
    flexDirection: 'row',
    marginLeft:25,
    marginRight:25,
    marginTop:20,
    marginBottom:15
  },
  temp1:{ 
    textAlign: 'center',
    fontSize:17,
  },
  temp2:{
    textAlign: 'center',
    fontSize:17
  },
  delta_temp:{
    flex:1,
    textAlign: 'center',
    fontSize:17
  },
  table_container:{
    marginTop:8,
  },
  row_container_header:{
    paddingLeft:30,
    paddingRight:30,
    flexDirection: 'row',
  },
  row_container:{
    flex:5,
    flexDirection: 'row',
    height:40,
    backgroundColor:'#e4e4e4',
    paddingLeft:30,
    paddingRight:30,
    marginBottom:3,
    marginTop:1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row_child:{
    margin:5,
    flex:1,
    textAlign: 'center',
  },
  row_child_index:{
    margin:5,
    textAlign: 'center',
  },
  row_child_head:{
    margin:5,
    flex:1,
    textAlign: 'center',
    fontWeight:"500",
    marginTop:10,
  },
  row_child_index_head:{
    margin:5,
    textAlign: 'center',
    fontWeight:"500",
    marginTop:10,
  },
  table_container_wrapper:{
  },
});

AppRegistry.registerComponent('fizica_android', () => fizica_android);
