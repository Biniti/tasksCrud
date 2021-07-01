import React, {useEffect, useState} from 'react';
import { StyleSheet , View, Text, Alert, TextInput, Button, TouchableOpacity, CheckBox } from 'react-native';
import { Formik } from 'formik';
import { url } from './url'
import Loading from './components/loading'
export default function App() {
  const [taskList, setTaskList] = useState([])
  const [edit, setEdit] = useState(false)
  const [editField, setEditField] = useState({})
  const [willDo, setWillDo] = useState(true)
  const [doing, setDoing] = useState(false)
  const [did, setDid] = useState(false)
  const [loading, setLoading] = useState(false)

  const getTasks = async () =>{
      const response = await fetch(url)
      return response.json()
  }

  useEffect(() =>{
    getTasks().then(response => setTaskList(response))  
  },[])

  const sendTasks = async (data={}) =>{
      const response = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify(data)
      })
      return response.json()
  }
  const editTasks = async (data={}, id) =>{
    const newUrl = `${url}/${id}`
    const response = await fetch(newUrl, {
      method: 'PUT',
      headers:{'Content-Type' : 'application/json'},
      body: JSON.stringify(data),
    })
    return response.json()
  }
  const DeleteTasks = async (id) =>{
    const newUrl = `${url}/${id}`
    const response = await fetch(newUrl, {
      method: 'DELETE'
    })
    return response.json()
  }

  const handleFormSubmit = async (values) =>{
      try{
        setLoading(true)
        const formData = {title: values.title, description: values.description}
        await sendTasks(formData)
        const tasks = await getTasks()
        setTaskList(tasks)
        setLoading(false)
        Alert.alert(
          'Task adicionada',
          `sua task ${values.title} foi adicionada com sucesso`
        )
      }catch(error){
          Alert.alert('ERROR ' + error)
      }
  }

  const handleEditTask = (task) =>{
      setEdit(true)
      setEditField(task)
    }

  const confirmEdit = async (values) =>{
     try{
        setLoading(true)
        if(values.title == '' || values.description == ''){
          Alert.alert('Preencha todos os campos')
          return
      }
      const formData = {title: values.title, description: values.description, column: editField.column}
      await editTasks(formData, editField.id)
      const tasks = await getTasks()
      setLoading(false)
      Alert.alert(
        'Tarefa editada',
        `Tarefa ${editField.title} foi editada com sucesso`
      )
      setTaskList(tasks)
     }catch(error){
       Alert.alert('ERROR ' + error)
     }finally{    
      setEditField({})
      setEdit(false)
     }
  }
  const willDoChecked = () =>{
    setWillDo(true)
    setDoing(false)
    setDid(false)
    setEditField({...editField, column: 'A_FAZER'})
  }
  const doingChecked = () =>{
    setWillDo(false)
    setDoing(true)
    setDid(false)
    setEditField({...editField, column: 'FAZENDO'})
  }
  const didChecked = () =>{
    setWillDo(false)
    setDoing(false)
    setDid(true)
    setEditField({...editField, column: 'FEITO'})
  }
  const handleDeleteTask = async (task) =>{
      try{
        setLoading(true)
        await DeleteTasks(task.id)
        const tasks = await getTasks()
        setTaskList(tasks)
        setLoading(false)
        Alert.alert(
          'Tarefa removida',
          `Tarefa ${task.title} foi removida com sucesso`
        )
      }catch(error){
        Alert.alert('ERROR ' + error)
      }
  }
  return (
    <View style={styles.container}>
      { loading ? <Loading /> :        
         <View style={styles.listContainer}>
            <View>
            <Text>A FAZER</Text>
            {
              taskList.filter((task) =>{
                  return task.column === 'A_FAZER'
              }).map( task =>(
                  <View key={task.id}>
                    <Text>{task.title}: {task.description}</Text>
                    
                    <TouchableOpacity onPress={() =>{handleEditTask(task)}}>
                      <Text style={styles.editText}>Editar</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity onPress={() =>{handleDeleteTask(task)}}>
                      <Text style={styles.removeText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
              ))
            }
            </View>
    
            <View>
              <Text>FAZENDO</Text>
              {
                taskList.filter((task) =>{
                    return task.column === 'FAZENDO'
                }).map( task =>(
                    <View key={task.id}>
                    <Text>{task.title}: {task.description}</Text>
                    
                    <TouchableOpacity onPress={() =>{handleEditTask(task)}}>
                      <Text style={styles.editText}>Editar</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity onPress={() =>{handleDeleteTask(task)}}>
                      <Text style={styles.removeText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                ))
              }
            </View>
    
            <View >
              <Text>FEITO</Text>
              {
                taskList.filter((task) =>{
                    return task.column === 'FEITO'
                }).map( task =>(
                    <View key={task.id}>
                    <Text>{task.title}: {task.description}</Text>
                    
                    <TouchableOpacity onPress={() =>{handleEditTask(task)}}>
                      <Text style={styles.editText}>Editar</Text>
                    </TouchableOpacity>
    
                    <TouchableOpacity onPress={() =>{handleDeleteTask(task)}}>
                      <Text style={styles.removeText}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                ))
              }
            </View>
         </View>
        }
         {
           edit ?
             <Formik
               enableReinitialize
               initialValues={{
                 title: editField.title, 
                 description: editField.description}}
               onSubmit={values => confirmEdit(values)}
             >
               {
                 ({handleBlur, setFieldValue, resetForm, values}) =>(
                   <View>
                       <TextInput 
                         style={styles.input}
                         onChangeText={text => setFieldValue('title', text)}
                         onBlur={handleBlur('title')}
                         value={values.title}
                       />
                       
                       <TextInput
                         style={styles.input} 
                         onChangeText={text => setFieldValue('description', text)}
                         onBlur={handleBlur('description')}
                         value={values.description}
                       />
                       <View style={styles.checkBoxContainer}>
                         <View style={styles.CheckBox}>
                         <CheckBox 
                           value={willDo}
                           onValueChange={willDoChecked}
                         />
                           <Text>A fazer</Text>
                         </View>
                         <View style={styles.CheckBox}>
                         <CheckBox 
                           value={doing}
                           onValueChange={doingChecked}
                         />
                           <Text>Fazendo</Text>
                         </View>
                         <View style={styles.CheckBox}>
                         <CheckBox 
                           value={did}
                           onValueChange={didChecked}
                         />
                           <Text>Feito</Text>
                         </View>
                       </View>
 
                       <Button onPress={() =>{confirmEdit(values); resetForm()}}        
                         title='Editar'/>
                       <Button onPress={() => {setEdit(false)}} title='Cancelar'/>
                   </View>
                 )
               }
             </Formik>
           :
           <Formik
           initialValues={{title: '', description: ''}}
           onSubmit={values => handleFormSubmit(values)}
         >
           {
             ({handleBlur, setFieldValue, resetForm, values}) =>(
               <View>
                   <TextInput 
                     style={styles.input}
                     onChangeText={text => setFieldValue('title', text)}
                     onBlur={handleBlur('title')}
                     value={values.title}
                   />
                   
                   <TextInput
                     style={styles.input} 
                     onChangeText={text => setFieldValue('description', text)}
                     onBlur={handleBlur('description')}
                     value={values.description}
                   />
 
                   <Button onPress={() =>{handleFormSubmit(values); resetForm()}}                
                     title='Cadastrar'/>
               </View>
             )
           }
         </Formik>
         }
    </View>
  );
}


const styles= StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
  },
  listContainer: {
    justifyContent: 'space-around',
    height: 350,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 5,
    backgroundColor: '#DEDDDB',
  },
  editText: {
    color: '#9B8718',
  },
  removeText: {
    color: 'red',
    marginBottom: 5,
  },
  checkBoxContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    margin: 5,
  },
  CheckBox:{
    flexDirection: 'row',
    alignItems: 'center',
  }
})