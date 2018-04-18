<?php

namespace Octave\CMSBundle\Form\DataTransformer;

use Symfony\Component\Form\DataTransformerInterface;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
class SerializeDataTransformer implements DataTransformerInterface
{
    /**
     * @param mixed $value
     * @return mixed
     */
    public function transform($value)
    {
        if (!is_string($value)) {
            $output = $value;
        }
        else {
            $output = \unserialize($value);
        }

        return $output;
    }

    /**
     * @param mixed $value
     * @return mixed|string
     */
    public function reverseTransform($value)
    {
        if (is_string($value)) {
            return $value;
        }

        return \serialize($value);
    }
}