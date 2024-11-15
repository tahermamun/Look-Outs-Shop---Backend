import axios from 'axios';
import AppError from './appError';
import catchAsync from './catchAsync';

export const sendSmsFromServer = catchAsync(async (req, res, next) => {
    const SmsSecrets = await SmsMgt.findOne().lean().sort({ createdAt: -1 });
    const { user, pass, sender } = SmsSecrets;
    const dataForSend = await JSON.stringify([
        {
            ...req.body,
            user,
            pwd: pass,
            sender,
        },
    ]);
    const { data } = await axios.post('https://mshastra.com/sendsms_api_json.aspx', dataForSend, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    console.log(data, ' data after request');
    if (!data) next(new AppError('SMS API not working', 404));
    const saveLog = await SmsSystem.create({
        ...req.body,
        status: data[0]?.str_response?.split(',')[2] || 'Send Failed',
        user,
        sender,
    });
    if (!saveLog) next(new AppError('Error on saved log', 404));
    res.status(200).json({
        status: 'success',
        message: 'Message Send Successfully and Save logs',
    });
});
