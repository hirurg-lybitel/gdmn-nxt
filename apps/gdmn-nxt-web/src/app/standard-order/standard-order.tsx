import Step from '@mui/material/Step/Step';
import StepButton from '@mui/material/StepButton/StepButton';
import Stepper from '@mui/material/Stepper/Stepper';
import './standard-order.module.less';

/* eslint-disable-next-line */
export interface StandardOrderProps {}

const steps = ['Select Standard', 'Confirm', 'Get Bill', 'Pay Bill', 'Acknowledge Payment', 'Make Task', 'Produce Standard', 'Send', 'Confirm Receiving'];

export function StandardOrder(props: StandardOrderProps) {
  return (
    <div>
      <Stepper nonLinear activeStep={0}>
        {steps.map((label, index) => (
          <Step key={label} completed={false}>
            <StepButton color="inherit" onClick={ () => {} }>
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
    </div>
  );
}

export default StandardOrder;
