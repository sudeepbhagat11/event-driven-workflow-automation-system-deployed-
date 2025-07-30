import { Container, Row, Col } from "react-bootstrap";
import React, { ReactNode } from "react";

interface FormContainerProps {
  children: ReactNode;
}

const FormContainer: React.FC<FormContainerProps> = ({ children }) => {
  return (
    <Container
      fluid
      className="min-vh-100 d-flex align-items-center justify-content-center "
    >
      <Row className="justify-content-md-center w-100">
        <Col
          xs={12}
          md={8}
          lg={6}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 p-md-5"
        >
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default FormContainer;
