import React, { useRef } from "react";
import { CardComponent } from '@chargebee/chargebee-js-react-wrapper';

export default function ChargebeeSubscription() {
    const cardRef = useRef<any>(null);

    // handle changes in the component
    function CardChange(change: any) {
        console.log(change);
    }

    // submit and generate chargebee token
    function Submit(e: any) {
        if (e) e.preventDefault();
        var cardInstance = cardRef.current as any;
        if (cardInstance) {
            cardInstance.tokenize({}).then((data: { token: any; }) => {
                console.log('chargebee token', data.token);
                // send api call to create subscription & payment source
            });
        }
    }
    
    return (
        <>
            <form>
                <CardComponent ref={cardRef} onChange={CardChange}/>
                <button type="submit" onClick={Submit}>Submit</button>
            </form>
        </>
    );
}