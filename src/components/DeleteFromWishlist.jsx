'use client'
import { AlertDialog, Button } from '@heroui/react';
import React from 'react';
import toast from 'react-hot-toast';

const DeleteFromWishlist = ({title , productId , userEmail , nextPath}) => {
    const handleDeleteFromWishList = async()=>{
         const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist/${userEmail}/${productId}`,
            {
                method:"DELETE",
                headers:{
                    "Content-Type":"application/json"
                }
            }
         )
         if(!response.ok){
              toast.error("something wrong when Delete the item from wishlist");
              return;
         }

         nextPath();
         toast.success(`${title} is Deleted from Cardlist`);
    }
    return (
        <AlertDialog>
      <Button variant="danger" >Delete </Button>
      <AlertDialog.Backdrop>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[400px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>Delete project permanently?</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <p>
                This will permanently delete <strong>{title}</strong> and all of its
                data. This action cannot be undone.
              </p>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Cancel
              </Button>
              <Button slot="close" onClick={handleDeleteFromWishList} variant="danger">
                Delete 
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
    );
};

export default DeleteFromWishlist;