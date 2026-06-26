export async function getGenders() {
  return [
    { id: 'male', name: 'Male' },
    { id: 'female', name: 'Female' },
    { id: 'lgbt', name: 'LGBT' },
    { id: 'others', name: 'Others' },
  ];
}

export async function getMaritalStatuses() {
  return [
    { id: 'single', name: 'Single' },
    { id: 'married', name: 'Married' },
    { id: 'divorced', name: 'Divorced' },
    { id: 'widowed', name: 'Widowed' },
    { id: 'separated', name: 'Separated' },
    { id: 'engaged', name: 'Engaged' },
    { id: 'livein', name: 'Livein' },
    { id: 'others', name: 'Others' },
  ];
}
