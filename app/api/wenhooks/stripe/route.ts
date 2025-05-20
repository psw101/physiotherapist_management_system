// In your webhook handler for stripe events
async function handleAppointmentPayment(session: Stripe.Checkout.Session, orderDetails: any) {
  try {
    const { id: appointmentId, patientId } = orderDetails;
    
    if (!appointmentId) {
      throw new Error('Missing appointment ID');
    }
    
    // Update appointment status
    await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'scheduled',
        paymentStatus: 'paid'
      }
    });
    
    // Extract payment intent ID
    const paymentIntentId = typeof session.payment_intent === 'object' 
      ? session.payment_intent.id 
      : session.payment_intent;
    
    // Create payment record
    await prisma.payment.create({
      data: {
        appointmentId,
        amount: session.amount_total! / 100,
        method: 'card',
        status: 'completed',
        transactionId: paymentIntentId,
        paymentType: 'appointment',
        patientId: parseInt(patientId)
      }
    });
    
    console.log(`Appointment payment processed successfully for ID: ${appointmentId}`);
  } catch (error) {
    console.error('Error processing appointment payment:', error);
    throw error;
  }
}