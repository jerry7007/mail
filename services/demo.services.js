const nodemailer = require('nodemailer');


const updateCampaignMappingDetails = async function (data) {
    // console.log("updateCampaignMappingDetails", data.body.name);
    // let name = data.body.name;
    // setTimeout(10000);
    // for (var i = 0; i <= 10; i++) {

    // printNumbersForEvery2Sec(10);
    // aprint(i);
    // await to(aprint(i));
    // }
    // sendMail()
    let [updateCampaignMailErr, updateCampaignMail] = await to(sendMail(data.body));

    if (updateCampaignMail) {
        // return {name: name};
        console.log("updateCampaignMail", updateCampaignMail);
        return true;
    } else {
        // console.log("updateCampaignMailErr", updateCampaignMailErr);
    }


    // return true;
}
module.exports.updateCampaignMappingDetails = updateCampaignMappingDetails;

// const printNumbersForEvery2Sec = (n) => {
//     for (let i = 0; i < n; i++) {
//         setTimeout(() => {
//             console.log(i)
//         }, i * 2000);
//         console.log("i",i);
//         if (i == (n - 1)) {
//             console.log("yes1 bro " + i, (n - 1));
//         }
//     }
//     // console.log("yes bro");
// }


const sendMail = async function (data) {
    console.log({ "info": "sendMail function called" })
    if (data?.sender && data?.content) {
        //   return TE("err.message dummy bro");

        // let mailTransporter = nodemailer.createTransport({
        //     service: 'gmail',
        //     auth: {
        //         user: 'ajaysixfacegod@gmail.com',
        //         pass: 'sgwhnncqxdghktwa'
        //     }
        // });
        let [mailTransporterErr, mailTransporter] = await to(createMailTransport(data));
        console.log("mailTransporterErr", mailTransporterErr);

        let mailDetails = {
            from: 'ajaysixfacegod@gmail.com',
            // to: 'ajay44@mailinator.com',
            to: data?.sender,
            subject: 'Test mail',
            text: data?.content
        };

        let [updateCampaignMailErr, updateCampaignMail] = await to(mailTransporter.sendMail(mailDetails));
        // mailTransporter.sendMail(mailDetails, function (err, data) {
        //     if (err) {
        //         console.log('Error Occurs', err);
        //     } else {
        //         console.log('Email sent successfully', data);

        //     }
        //     return data;
        // });
        // console.log({ "info": "sendMail function sucessfully" });
        // console.log("updateCampaignMailErr", updateCampaignMailErr);
        // console.log("updateCampaignMail", updateCampaignMail);
        // if(updateCampaignMail){
        //     return true;
        // }
        return updateCampaignMail;
    } else {
        return data?.sender ? "Content is missing" : "Sender is missing"

    }
    // return true;

}
module.exports.sendMail = sendMail;




const createMailTransport = async function (data) {
    let mailTransporter;
    if (data?.mailId && data?.code && data?.service) {
        mailTransporter = nodemailer.createTransport({
            service: data?.service,
            auth: {
                user: data?.mailId,
                pass: data?.code
            }
        });
    } else {
        mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ajaysixfacegod@gmail.com',
                pass: 'sgwhnncqxdghktwa'
            }
        });
    }

    return mailTransporter;
}
module.exports.createMailTransport = createMailTransport;