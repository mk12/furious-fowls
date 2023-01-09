// Copyright 2022 Mitchell Kember. Subject to the MIT License.

const initializers: VoidFunction[] = [];

// Registers a function to be run on initialization.
export function registerInitializer(init: VoidFunction): void {
  initializers.push(init);
}

// Runs all registered initializers.
export function runInitializers(): void {
  for (const init of initializers) {
    init();
  }
}
