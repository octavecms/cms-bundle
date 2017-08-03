<?php

namespace VideInfra\CMSBundle\Form\Type;

use Symfony\Component\Form\AbstractType;

/**
 * @author Igor Lukashov <igor.lukashov@videinfra.com>
 */
class BlockType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('blocks');
    }
}