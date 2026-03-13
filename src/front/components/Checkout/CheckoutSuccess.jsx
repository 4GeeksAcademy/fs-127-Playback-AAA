// Pantalla de éxito tras el pago

const CheckoutSuccess = () => {
    return (
        <div className="max-w-lg mx-auto px-6 py-24 text-center space-y-4">
            <div className="text-5xl">✅</div>
            <h1 className="text-2xl font-semibold">¡Pago realizado!</h1>
            <p className="text-stone-500">
                Tu pedido está siendo procesado. Te redirigimos a tus pedidos...
            </p>
        </div>
    );
};

export default CheckoutSuccess;