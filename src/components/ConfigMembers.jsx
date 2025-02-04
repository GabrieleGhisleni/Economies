import { useFormik } from 'formik';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { memberSlice } from './../features/memberSlice'
import { Button, Col, Container, Form, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row, Table } from 'reactstrap';
import toast, { Toaster } from 'react-hot-toast';

const RenderMember = () => {
    var axios = require("axios")
    const dispatch = useDispatch()
    const token = useSelector(state => state.auth.token)
    const headers = { Authorization: `Bearer ${token}` }
    const BASE_URL = useSelector(state => state.members.base_url)
    const url = `${BASE_URL}/api/members/`
    const [type, setType] = useState("delete")
    const [addModal, setaddModal] = useState(false)




    const AddModal = () => {
        const formik = useFormik({
            initialValues: { member_name: "" },
            onSubmit: (values, { resetForm }) => {
                values.member_name = values.member_name.charAt(0).toUpperCase() + values.member_name.slice(1);
                setaddModal(!addModal)
                switch (type) {
                    case "add":
                        addMember(values.member_name);
                        break;
                    case "delete":
                        deleteMember();
                        break;
                    default:
                        modifyMember(values.member_name);
                        break;
                }
                resetForm()
            }
        });

        function addMember(new_name) {
            var config = {
                method: 'post',
                url: url,
                headers: headers,
                data: { member_name: new_name }
            };
            axios(config)
            .then(res=>{ 
                dispatch(memberSlice.actions.addMember(res.data)) 
                toast.success('Successfully created!', { duration: 4000, position: 'top-center',})
            })
            .catch(e => {
                toast.error('Something went wrong!', {duration: 4000, position: 'top-center',})
                let err = {e}
                try {if (err.e.response.data.forbidden.includes("exceeded")) alert('Max Members Exceeded')}
                catch{}
            })
        }

        function deleteMember() {
            var config = {
                method: 'delete',
                url: url,
                headers: headers,
                data: { id: current.id }
            };

            axios(config)
            .then(() => {dispatch(memberSlice.actions.removeMember(current.id))
                toast.success('Successfully deleted!', { duration: 4000, position: 'top-center',})})
                .catch(e =>  toast.error('Something went wrong!', {duration: 4000, position: 'top-center',})({ e })) //console.log
        }


        function modifyMember(new_name) {
            var config = {
                method: 'put',
                url: url,
                headers: headers,
                data: { id: current.id, member_name: new_name }
            };
            axios(config)
            .then((values) =>{dispatch(memberSlice.actions.updateMember({values}))
            toast.success('Successfully updated!', { duration: 4000, position: 'top-center',})})
            .catch(e =>  toast.error('Something went wrong!', {duration: 4000, position: 'top-center',}) ({ e })) //console.log
        }

        return (
            <Modal isOpen={addModal} toggle={() => setaddModal(!addModal)}>
                <ModalHeader close={<button className="close" onClick={() => setaddModal(!addModal)}>×
                </button>}>Form</ModalHeader>
                <ModalBody>
                    <Form onSubmit={formik.handleSubmit}>
                        <Container>
                            {type != "delete" ?
                                <FormGroup>
                                    <Row className="align-items-center">
                                        <Col xs="4" >
                                            <Label>Member Name</Label>
                                        </Col>
                                        <Col>
                                            <Input
                                                name="member_name"
                                                id="member_name"
                                                type="text"
                                                onChange={formik.handleChange}
                                                value={formik.values.member_name}
                                                placeholder='Insert the new Member Name'
                                                required
                                            />
                                        </Col>
                                    </Row>
                                </FormGroup> :
                                <Container>
                                    <Row>
                                        <Col xs={12}>
                                            <span>Are you sure to delete?</span>
                                        </Col>
                                        </Row>
                                        <Row className='text-center'>
                                            <Col xs={12} >
                                                <span><h3 className='deleteName'>{current.member_name}</h3></span>
                                            </Col>
                                            <span>Deleting the member will imply lose all the records produced by this member.</span>
                                        </Row>


                                </Container>
                            }
                            {type != "delete" ?
                                <Row className="text-center">
                                    <Col xs={12}>
                                        <Button type="submit" className='subButton' color='primary'>
                                            Save Member
                                        </Button>
                                        <Button type="reset" className='subButton' onClick={() => setaddModal(!addModal)} color='secondary'>
                                            Cancel
                                        </Button>
                                    </Col>
                                </Row> :
                                <Row className="text-center">
                                    <Col xs={12}>
                                        <Button type="submit" className='subButton' color='danger'>
                                            Delete Member
                                        </Button>
                                        <Button type="reset" className='subButton' onClick={() => setaddModal(!addModal)} color='secondary'>
                                            Cancel
                                        </Button>
                                    </Col>
                                </Row>}

                        </Container>
                    </Form >
                </ModalBody>
            </Modal>);
    }

    const members = useSelector(state => state.members.members)
    const [current, setCurrent] = useState({})
    // if (members.lenght > 0) {setCurrent(members[0])}

    let i = 0;
    const membersRendered = members.map((r) => {
        i++;
        return (
            <tr key={r.id}>
                <td>{i}</td>
                <td>{r.member_name}</td>
                <td>
                    <Button color="primary" onClick={() => { setaddModal(!addModal); setType("update"); setCurrent(r) }} ><i className='fa fa-refresh'></i></Button>
                    <Button color="danger" onClick={() => { setaddModal(!addModal); setType("delete"); setCurrent(r) }} ><i className='fa fa-trash-o sm'></i></Button>
                </td>
            </tr>
        );
    });
    return (
        <Row className='confRow'>
            <AddModal />
            < Toaster/>
            <Col>
                <Row>
                    <Col xs='auto'>
                        <h2>Member</h2>
                    </Col>
                    <Col>
                        <Button color='success' onClick={() => { setaddModal(!addModal); setType("add") }}>Add Member</Button>
                    </Col>
                </Row>
                <Row className='text-center'>
                    <Table hover responsive>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {membersRendered}
                        </tbody>
                    </Table>
                </Row>
            </Col>
        </Row>
    );

}
export default RenderMember;
