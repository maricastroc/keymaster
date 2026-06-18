import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 cursor-pointer rounded-lg font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-yellow-500 text-on-accent hover:brightness-110 font-semibold',
        ghost: 'bg-transparent text-neutral-400 hover:bg-neutral-700 hover:text-white',
        outline: 'border border-neutral-700 text-neutral-400 hover:border-blue-400 hover:text-blue-400',
        destructive: 'bg-red-500 text-white hover:brightness-90 w-full',
      },
      size: {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2 text-sm',
        lg: 'px-8 py-4 text-base',
        icon: 'p-1.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = ({
  className,
  variant,
  size,
  isLoading = false,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};

export { buttonVariants };
