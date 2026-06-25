"use client";

import {Envelope} from "@gravity-ui/icons";
import {Button, Input, Label, Modal, Surface, TextField} from "@heroui/react";


export function TakeAdreessForm({price  , productId, productTitle , sellerEmail}) {
 
   const handlePayment = async(e)=>{
           e.preventDefault();
            const formdata = new FormData(e.target);
            const dat = Object.fromEntries(formdata.entries());
            console.log(dat);
           const response = await fetch('/api/checkout_sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                price,
                productId,
                productTitle,
                phone:dat?.phone,
                address:dat?.address,
                sellerEmail
            })
        });
        
        if (!response.ok) {
             console.error('Failed to create checkout session. Please try again.');
             return;
        }
        const data = await response.json();
        window.location.href = data.url;
    }
  return (
    <Modal>
      <Button variant="secondary" className={`text-[#35858E]`}>Buy Now</Button>
      <Modal.Backdrop>
        <Modal.Container placement="auto">
          <Modal.Dialog className="sm:max-w-md">
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Icon className="bg-accent-soft text-accent-soft-foreground">
                <Envelope className="size-5" />
              </Modal.Icon>
              <Modal.Heading>Contact Us</Modal.Heading>
              <p className="mt-1.5 text-sm leading-5 text-muted">
                Fill out the form below and we'll get back to you. The modal adapts automatically
                when the keyboard appears on mobile.
              </p>
            </Modal.Header>
            <Modal.Body className="p-6">
              <Surface variant="default">
                <form onSubmit={handlePayment} className="flex flex-col gap-4">
                  <TextField className="w-full" name="address" type="text" variant="secondary">
                    <Label>Address</Label>
                    <Input placeholder="Enter your name" />
                  </TextField>
                  <TextField className="w-full" name="phone" type="tel" variant="secondary">
                    <Label>Phone</Label>
                    <Input placeholder="Enter your phone number" />
                  </TextField>
                <Modal.Footer>
                <Button slot="close" variant="secondary">
                    Cancel
                </Button>
                 <Button type="submit" slot="close" variant="outline" className={`flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-[#35858E] border-[#35858E] rounded-xl hover:bg-[#35858E]/10 transition-colors duration-200`}>Processed</Button> 
                 {/* <BuyCourse price={price} productId={productId} productTitle={productTitle} /> */}
                </Modal.Footer>
                </form>
              </Surface>
            </Modal.Body>

          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}