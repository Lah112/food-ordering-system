import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "<your-email>@gmail.com",
    pass: "####",
  },
});

export const sendOrderConfirmationEmail = async (userEmail, orderDetails) => {
  try {
    const mailOptions = {
      from: '"Food Delivery App" <assigmentgroupy@gmail.com>',
      to: userEmail,
      subject: `Order Confirmation #${orderDetails._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4CAF50;">Thank you for your order!</h2>
          <p>Your order has been received and is being processed.</p>
          
          <h3>Order Details</h3>
          <p><strong>Order ID:</strong> ${orderDetails._id}</p>
          <p><strong>Date:</strong> ${new Date(orderDetails.placedAt).toLocaleString()}</p>
          <p><strong>Delivery Address:</strong> ${orderDetails.deliveryAddress}</p>
          <p><strong>Payment Method:</strong> ${orderDetails.paymentMethod}</p>
          
          <h3>Items Ordered</h3>
          <ul>
            ${orderDetails.items.map(item => `
              <li>
                ${item.quantity}x ${item.name} - $${item.price.toFixed(2)} each
                (Total: $${(item.price * item.quantity).toFixed(2)})
              </li>
            `).join('')}
          </ul>
          
          <p><strong>Total Amount:</strong> $${orderDetails.totalAmount.toFixed(2)}</p>
          
          ${orderDetails.specialInstructions ? `
            <h3>Special Instructions</h3>
            <p>${orderDetails.specialInstructions}</p>
          ` : ''}
          
          <p>We'll notify you when your order is on its way!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};