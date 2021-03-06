<?php

namespace Octave\CMSBundle\Entity;

use Symfony\Component\PropertyAccess\PropertyAccess;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 */
trait TranslatableEntityTrait
{
    /**
     * @param $method
     * @param $arguments
     * @return mixed|null
     */
    public function __call($method, $arguments)
    {
        try {
            return PropertyAccess::createPropertyAccessor()->getValue($this->translate(), $method);
        }
        catch (\Exception $e) {
            return null;
        }
    }
}