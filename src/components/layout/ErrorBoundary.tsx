import { Component, type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 py-12 text-center"
        >
          <p className="text-sm text-gentle-600/70 dark:text-gentle-100/70 leading-relaxed">
            出了一点小问题，刷新一下就好。
          </p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="inline-flex items-center gap-2 rounded-full border border-gentle-300/50 bg-gentle-200/70 px-5 py-2 text-sm font-medium text-gentle-700 transition-colors duration-300 hover:bg-gentle-300/60 cursor-pointer dark:border-gentle-600/40 dark:bg-gentle-700/40 dark:text-gentle-50 dark:hover:bg-gentle-600/40"
          >
            刷新页面
          </button>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
