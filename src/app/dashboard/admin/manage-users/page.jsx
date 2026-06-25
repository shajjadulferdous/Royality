import React from 'react';

const ManageUserPage = async() => {
    const users = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`,{
        method:"GET",
        headers:{
            "Content-type":"application/json"
        }
    })

    return (
        <div>
            <h1>All Users</h1>
            <div>
                {
                    users.map((user) => (
                        <div key={user.id}>
                             <div>
                                <Image src={user.image} alt={user.name} width={50} height={50} />
                                <h3>{user.name}</h3>
                                <p>{user.email}</p>
                             </div>
                             <div>{user.role}</div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
};

export default ManageUserPage;