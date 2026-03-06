// Precio final del producto. Si hay descuento, muestra el original tachado al lado.
export const ProductPrice = ({ price, discount = 0, className = "" }) => {
  const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

  return (
    <div className={`flex items-baseline gap-1.5 ${className}`}>
      <span className="text-sm font-bold text-violet-600 dark:text-violet-400">
        {finalPrice.toFixed(2)}€
      </span>
      {discount > 0 && (
        <span className="text-xs text-theme-muted line-through">
          {price.toFixed(2)}€
        </span>
      )}
    </div>
  );
};
